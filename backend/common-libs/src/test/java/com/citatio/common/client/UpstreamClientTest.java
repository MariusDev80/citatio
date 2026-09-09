package com.citatio.common.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.Duration;

import com.citatio.common.dto.UpstreamStatus;
import com.citatio.common.dto.UpstreamStatus.FailureReason;
import com.citatio.common.dto.UpstreamStatus.State;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

/**
 * Verifie la garantie centrale de l'architecture : un microservice injoignable
 * ne fait jamais echouer celui qui l'appelle, et la reponse dit pourquoi sans
 * decrire l'infrastructure.
 *
 * <p>Les pannes sont simulees par {@link MockRestServiceServer}, branche sur le
 * builder de {@link RestClientFactory} : le classement des motifs se teste ainsi
 * sans dependre de ce qu'une vraie socket voudra bien renvoyer.
 */
class UpstreamClientTest {

    private static final String BASE_URL = "http://u1-communication:8081";
    private static final String HEALTH_PATH = "/api/u1/health";
    private static final String SERVICE = "u1-communication";

    /** Monte un client dont l'unique appel attendu recevra la reponse decrite par l'appelant. */
    private record Fixture(UpstreamClient client, MockRestServiceServer server) {
    }

    private Fixture fixture() {
        RestClient.Builder builder = RestClientFactory.builder(BASE_URL);
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        return new Fixture(new UpstreamClient(SERVICE, builder.build(), HEALTH_PATH), server);
    }

    @Test
    @DisplayName("Upstream sain : REACHABLE, avec la sante renvoyee par le voisin")
    void returnsReachableWithPayload() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withSuccess("""
                        {"service":"u1-communication","status":"UP","timestamp":"2026-09-03T10:00:00Z"}
                        """, MediaType.APPLICATION_JSON));

        UpstreamStatus status = fixture.client().fetchHealth();

        assertThat(status.state()).isEqualTo(State.REACHABLE);
        assertThat(status.reason()).isNull();
        assertThat(status.payload()).isNotNull();
        assertThat(status.payload().status()).isEqualTo("UP");
        fixture.server().verify();
    }

    @Test
    @DisplayName("Upstream en erreur 500 : absorbe en HTTP_ERROR, pas propage")
    void absorbsServerError() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH)).andRespond(withServerError());

        UpstreamStatus status = fixture.client().fetchHealth();

        assertThat(status.state()).isEqualTo(State.UNREACHABLE);
        assertThat(status.reason()).isEqualTo(FailureReason.HTTP_ERROR);
        assertThat(status.payload()).isNull();
    }

    @Test
    @DisplayName("Upstream en erreur 404 : absorbe en HTTP_ERROR, pas propage")
    void absorbsClientError() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        UpstreamStatus status = fixture.client().fetchHealth();

        assertThat(status.state()).isEqualTo(State.UNREACHABLE);
        assertThat(status.reason()).isEqualTo(FailureReason.HTTP_ERROR);
    }

    @Test
    @DisplayName("Connexion refusee : CONNECTION_FAILED")
    void classifiesConnectionFailure() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withException(new ConnectException("Connection refused")));

        UpstreamStatus status = fixture.client().fetchHealth();

        assertThat(status.reason()).isEqualTo(FailureReason.CONNECTION_FAILED);
    }

    @Test
    @DisplayName("Lecture trop lente : TIMEOUT, distinct d'une connexion refusee")
    void classifiesTimeout() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withException(new SocketTimeoutException("Read timed out")));

        UpstreamStatus status = fixture.client().fetchHealth();

        assertThat(status.reason()).isEqualTo(FailureReason.TIMEOUT);
    }

    @Test
    @DisplayName("Corps illisible : INVALID_RESPONSE, toujours sans exception")
    void classifiesUnreadableBody() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withSuccess("ceci n'est pas du json", MediaType.APPLICATION_JSON));

        UpstreamStatus status = fixture.client().fetchHealth();

        assertThat(status.state()).isEqualTo(State.UNREACHABLE);
        assertThat(status.reason()).isEqualTo(FailureReason.INVALID_RESPONSE);
    }

    @Test
    @DisplayName("La reponse ne contient jamais l'URL ni le message d'erreur de l'upstream")
    void neverLeaksTopology() {
        Fixture fixture = fixture();
        fixture.server().expect(requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withException(
                        new ConnectException("Connection refused: " + BASE_URL + HEALTH_PATH)));

        UpstreamStatus status = fixture.client().fetchHealth();

        // Le record n'a plus de champ libre ou une URL interne pourrait passer :
        // seul le nom du service, deja present dans l'URL publique, est expose.
        assertThat(status.toString()).doesNotContain("8081").doesNotContain("Connection refused");
    }

    @Test
    @DisplayName("Apres des echecs repetes, le circuit s'ouvre et l'appel n'est plus emis")
    void opensCircuitAfterRepeatedFailures() {
        // Disjoncteur volontairement nerveux : deux appels suffisent a juger, la
        // configuration de production (5 appels minimum) demanderait un test plus
        // long sans rien prouver de plus.
        CircuitBreaker breaker = CircuitBreaker.of("test", CircuitBreakerConfig.custom()
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(2)
                .minimumNumberOfCalls(2)
                .failureRateThreshold(50f)
                .waitDurationInOpenState(Duration.ofMinutes(1))
                .build());

        RestClient.Builder builder = RestClientFactory.builder(BASE_URL);
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        UpstreamClient client = new UpstreamClient(SERVICE, builder.build(), HEALTH_PATH, breaker);

        // Exactement deux appels sont attendus cote serveur, pas trois.
        server.expect(ExpectedCount.times(2), requestTo(BASE_URL + HEALTH_PATH))
                .andRespond(withServerError());

        assertThat(client.fetchHealth().reason()).isEqualTo(FailureReason.HTTP_ERROR);
        assertThat(client.fetchHealth().reason()).isEqualTo(FailureReason.HTTP_ERROR);

        // Le troisieme appel doit etre refuse par le disjoncteur, sans toucher au
        // reseau : c'est tout l'interet, ne plus repayer le timeout a chaque requete.
        UpstreamStatus shortCircuited = client.fetchHealth();

        assertThat(shortCircuited.state()).isEqualTo(State.UNREACHABLE);
        assertThat(shortCircuited.reason()).isEqualTo(FailureReason.CIRCUIT_OPEN);
        // verify() echouerait si un troisieme appel etait parti vers l'upstream.
        server.verify();
    }

    @Test
    @DisplayName("Un upstream reellement coupe ne leve aucune exception")
    void neverThrowsAgainstARealClosedPort() {
        // Port 1 : reserve et jamais en ecoute. Ce test ne passe pas par le mock,
        // c'est le garde-fou de bout en bout, avec une vraie socket.
        UpstreamClient client = new UpstreamClient(
                SERVICE, RestClientFactory.create("http://localhost:1"), HEALTH_PATH);

        assertThatCode(client::fetchHealth).doesNotThrowAnyException();
        assertThat(client.fetchHealth().state()).isEqualTo(State.UNREACHABLE);
    }
}
