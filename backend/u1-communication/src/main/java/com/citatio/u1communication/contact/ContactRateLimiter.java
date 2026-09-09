package com.citatio.u1communication.contact;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

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
     * Consomme un jeton pour cette IP.
     *
     * @return {@code true} si la demande passe, {@code false} si le quota horaire
     *         est deja atteint
     */
    public boolean tryAcquire(String clientIp) {
        Instant now = Instant.now();
        if (recentHits.size() > SWEEP_THRESHOLD) {
            sweepExpired(now);
        }

        AtomicBoolean allowed = new AtomicBoolean();
        recentHits.compute(clientIp, (ip, hits) -> {
            Deque<Instant> window = hits == null ? new ArrayDeque<>() : hits;
            window.removeIf(hit -> hit.isBefore(now.minus(WINDOW)));

            boolean underQuota = window.size() < MAX_PER_WINDOW;
            if (underQuota) {
                window.addLast(now);
            }
            allowed.set(underQuota);
            return window;
        });
        return allowed.get();
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
