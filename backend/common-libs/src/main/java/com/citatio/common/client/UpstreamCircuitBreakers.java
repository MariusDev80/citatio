package com.citatio.common.client;

import java.time.Duration;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;

/**
 * Reglage du disjoncteur qui protege les appels inter-modules.
 *
 * <p><b>Le probleme resolu.</b> Les timeouts de {@link RestClientFactory} bornent
 * le cout d'<i>un</i> appel vers un voisin mort, pas celui de mille. Sans
 * disjoncteur, chaque requete entrante repaie ses 4 secondes d'attente, et un
 * voisin coupe se transforme en file d'attente qui sature les threads de
 * l'appelant. Le disjoncteur constate la panne une fois, puis repond
 * immediatement, ce qui rend l'independance des services reelle sous charge et
 * pas seulement sur un appel isole.
 *
 * <p><b>Pourquoi la bibliotheque coeur et pas le starter Spring.</b>
 * {@code resilience4j-spring-boot3} vise Spring Boot 3 et Spring Framework 6 ;
 * ce projet est sur Boot 4 / Framework 7. Le module
 * {@code resilience4j-circuitbreaker} est du Java nu, sans dependance a Spring :
 * il fonctionne quelle que soit la version du framework, se cable en trois lignes
 * dans {@link UpstreamClient}, et evite d'attendre un starter compatible.
 */
public final class UpstreamCircuitBreakers {

    /**
     * Nombre d'appels observes avant de juger. En dessous, le disjoncteur laisse
     * passer : ouvrir sur un unique echec au demarrage ferait passer un service
     * sain pour un service en panne.
     */
    private static final int MINIMUM_CALLS = 5;

    /** Taille de la fenetre glissante, en nombre d'appels. */
    private static final int SLIDING_WINDOW_SIZE = 10;

    /** Au-dela de ce taux d'echec sur la fenetre, le circuit s'ouvre. */
    private static final float FAILURE_RATE_THRESHOLD = 50f;

    /** Duree pendant laquelle on cesse d'appeler avant de retenter prudemment. */
    private static final Duration WAIT_IN_OPEN_STATE = Duration.ofSeconds(10);

    /** Appels de test autorises en etat semi-ouvert, pour detecter le retour du voisin. */
    private static final int CALLS_IN_HALF_OPEN_STATE = 3;

    private UpstreamCircuitBreakers() {
        // Classe utilitaire : pas d'instanciation.
    }

    /**
     * Construit le disjoncteur d'un upstream donne.
     *
     * <p>La transition automatique de OPEN vers HALF_OPEN est laissee inactive :
     * elle demanderait un scheduler dedie alors que le passage se fait tres bien
     * a la premiere requete recue apres le delai d'attente. Un service sans trafic
     * n'a aucune raison de sonder son voisin en arriere-plan.
     *
     * @param serviceName nom du microservice appele, qui nomme aussi le disjoncteur
     */
    public static CircuitBreaker forService(String serviceName) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(SLIDING_WINDOW_SIZE)
                .minimumNumberOfCalls(MINIMUM_CALLS)
                .failureRateThreshold(FAILURE_RATE_THRESHOLD)
                .waitDurationInOpenState(WAIT_IN_OPEN_STATE)
                .permittedNumberOfCallsInHalfOpenState(CALLS_IN_HALF_OPEN_STATE)
                .build();

        return CircuitBreaker.of(serviceName, config);
    }
}
