package com.citatio.u1communication.contact;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Limite le nombre de demandes de contact par IP : 5 par heure glissante.
 *
 * <p>En memoire, sans dependance ajoutee. Deux consequences a connaitre plutot
 * qu'a decouvrir : le compteur repart a zero a chaque redemarrage du conteneur,
 * et il est propre a l'instance. Le module tourne aujourd'hui en exemplaire
 * unique ; le jour ou il sera replique, ce garde-fou devra passer en Redis ou
 * equivalent. Pour freiner un envoi repete depuis le formulaire, il suffit.
 *
 * <p>Ce n'est pas une protection anti-DDoS, c'est un frein a l'abus du
 * formulaire. Le vrai filtrage de volume est le travail de la gateway.
 */
@Component
public class ContactRateLimiter {

    private static final int MAX_PER_WINDOW = 5;
    private static final Duration WINDOW = Duration.ofHours(1);

    /**
     * Au dela de ce nombre d'IP suivies, on passe un coup de balai sur les
     * fenetres expirees. Sans cela, une campagne distribuee ferait grossir la
     * table indefiniment : la limite protegerait le formulaire et fuirait la
     * memoire, ce qui reviendrait a deplacer le probleme.
     */
    private static final int SWEEP_THRESHOLD = 5_000;

    /**
     * Horodatages des demandes recentes, par IP.
     *
     * <p>Toute lecture comme toute ecriture d'une {@link Deque} se fait dans un
     * {@code compute} : la synchronisation par entree de ConcurrentHashMap suffit
     * alors, et aucune collection non synchronisee n'est manipulee hors verrou.
     */
    private final Map<String, Deque<Instant>> recentHits = new ConcurrentHashMap<>();

    /**
     * Consomme un creneau pour cette IP.
     *
     * <p>Sur un refus, le verdict porte le temps restant : la fenetre glisse, le
     * prochain creneau se libere quand la plus ancienne des demandes retenues
     * sort de l'heure. Ce delai est calcule, pas estime, et c'est lui que
     * l'en-tete {@code Retry-After} publie.
     */
    public RateLimitVerdict tryAcquire(String clientIp) {
        Instant now = Instant.now();
        if (recentHits.size() > SWEEP_THRESHOLD) {
            sweepExpired(now);
        }

        AtomicReference<RateLimitVerdict> verdict = new AtomicReference<>();
        recentHits.compute(clientIp, (ip, hits) -> {
            Deque<Instant> window = hits == null ? new ArrayDeque<>() : hits;
            window.removeIf(hit -> hit.isBefore(now.minus(WINDOW)));

            if (window.size() < MAX_PER_WINDOW) {
                window.addLast(now);
                verdict.set(RateLimitVerdict.granted());
            } else {
                verdict.set(RateLimitVerdict.refused(
                        Duration.between(now, window.getFirst().plus(WINDOW))));
            }
            return window;
        });
        return verdict.get();
    }

    /** Retire les IP dont toutes les demandes sont sorties de la fenetre. */
    private void sweepExpired(Instant now) {
        for (String ip : recentHits.keySet()) {
            recentHits.computeIfPresent(ip, (key, window) -> {
                window.removeIf(hit -> hit.isBefore(now.minus(WINDOW)));
                return window.isEmpty() ? null : window;
            });
        }
    }
}
