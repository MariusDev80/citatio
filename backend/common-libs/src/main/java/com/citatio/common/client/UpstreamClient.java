package com.citatio.common.client;

import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;

import com.citatio.common.dto.HealthResponse;
import com.citatio.common.dto.UpstreamStatus;
import com.citatio.common.dto.UpstreamStatus.FailureReason;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Client vers un microservice voisin, garantissant la <b>degradation gracieuse</b>.
 *
 * <p>Tout echec d'appel (connexion refusee, timeout, 4xx, 5xx, corps illisible)
 * est capture et traduit en {@link UpstreamStatus.State#UNREACHABLE}. L'appelant
 * n'a donc jamais a gerer d'exception, et reste disponible meme si l'upstream est
 * coupe : c'est la garantie d'independance entre u1-communication et u2-blog.
 *
 * <p>Le chemin de sante est fixe a la construction : c'est une propriete de
 * l'upstream, pas de l'appel, et le site d'appel n'a donc rien a savoir de la
 * forme des routes du voisin.
 *
 * <p>Les appels passent par un disjoncteur (voir {@link UpstreamCircuitBreakers}) :
 * une fois la panne constatee, on cesse d'attendre le timeout a chaque requete.
 */
@Slf4j
@RequiredArgsConstructor
public class UpstreamClient {

    /** Nom du microservice appele, pour le log et la reponse. */
    private final String serviceName;

    private final RestClient restClient;

    /** Chemin de l'endpoint de sante chez l'upstream (ex: "/api/u1/health"). */
    private final String healthPath;

    private final CircuitBreaker circuitBreaker;

    /**
     * Cablage courant : disjoncteur par defaut, nomme d'apres le service appele.
     *
     * <p>Le constructeur complet reste disponible pour les tests, qui ont besoin
     * de seuils atteignables en quelques appels.
     */
    public UpstreamClient(String serviceName, RestClient restClient, String healthPath) {
        this(serviceName, restClient, healthPath, UpstreamCircuitBreakers.forService(serviceName));
    }

    /**
     * Interroge l'endpoint de sante de l'upstream.
     *
     * @return l'etat de l'upstream, jamais {@code null}, ne leve jamais d'exception
     */
    public UpstreamStatus fetchHealth() {
        try {
            // L'appel HTTP est execute *dans* le disjoncteur, et laisse donc
            // remonter son exception : c'est ainsi que l'echec est comptabilise.
            // L'absorption se fait ici, en dehors, une fois la panne enregistree.
            HealthResponse body = circuitBreaker.executeCallable(this::callHealth);
            return UpstreamStatus.reachable(serviceName, body);

        } catch (CallNotPermittedException e) {
            // Circuit ouvert : aucun appel n'a ete emis. A capturer avant
            // RuntimeException, dont cette exception herite.
            log.debug("Upstream {} : circuit ouvert, appel non tente", serviceName);
            return UpstreamStatus.unreachable(serviceName, FailureReason.CIRCUIT_OPEN);

        } catch (Exception e) {
            // Volontairement non propage : l'indisponibilite d'un voisin est un etat
            // metier normal, pas une erreur du service courant. Le filet couvre
            // Exception et pas seulement RestClientException, parce que la garantie
            // vendue ici est absolue : aucune exception ne remonte, quelle que soit
            // la facon dont l'appel echoue. Le corps de callHealth se limite a un
            // appel HTTP, le risque de masquer un bug est minime.
            FailureReason reason = classify(e);
            log.warn("Upstream {} injoignable sur {} [{}] : {}",
                    serviceName, healthPath, reason, e.getMessage());
            return UpstreamStatus.unreachable(serviceName, reason);
        }
    }

    /** L'appel nu, sans filet : les echecs doivent remonter au disjoncteur. */
    private HealthResponse callHealth() {
        return restClient.get()
                .uri(healthPath)
                .retrieve()
                .body(HealthResponse.class);
    }

    /**
     * Traduit une panne en motif publiable. Voir
     * {@link FailureReason} : la reponse ne doit rien dire de l'infrastructure.
     */
    private static FailureReason classify(Exception e) {
        if (e instanceof RestClientResponseException) {
            return FailureReason.HTTP_ERROR;
        }
        if (e instanceof ResourceAccessException) {
            // Couche transport : on distingue le timeout du reste, parce que les
            // deux ne se corrigent pas au meme endroit (budget de temps contre
            // service arrete ou nom non resolu).
            return hasTimeoutCause(e) ? FailureReason.TIMEOUT : FailureReason.CONNECTION_FAILED;
        }
        return FailureReason.INVALID_RESPONSE;
    }

    /** Le timeout du client HTTP arrive enveloppe dans ResourceAccessException. */
    private static boolean hasTimeoutCause(Throwable e) {
        for (Throwable cause = e; cause != null; cause = cause.getCause()) {
            if (cause instanceof HttpTimeoutException || cause instanceof SocketTimeoutException) {
                return true;
            }
        }
        return false;
    }
}
