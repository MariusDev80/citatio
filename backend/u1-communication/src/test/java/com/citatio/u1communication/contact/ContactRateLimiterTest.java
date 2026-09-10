package com.citatio.u1communication.contact;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;

/** Garde-fou anti-abus : 5 demandes par heure et par IP, comptees separement. */
class ContactRateLimiterTest {

    @Test
    @DisplayName("Cinq demandes passent, la sixieme est refusee")
    void allowsFivePerHourThenRefuses() {
        ContactRateLimiter limiter = new ContactRateLimiter();

        for (int attempt = 1; attempt <= 5; attempt++) {
            assertThat(limiter.tryAcquire("203.0.113.7").allowed())
                    .as("demande n°%d", attempt)
                    .isTrue();
        }
        assertThat(limiter.tryAcquire("203.0.113.7").allowed()).isFalse();
    }

    @Test
    @DisplayName("Le refus dit dans combien de temps reessayer, jamais tout de suite")
    void refusalCarriesAUsableDelay() {
        ContactRateLimiter limiter = new ContactRateLimiter();
        for (int attempt = 1; attempt <= 5; attempt++) {
            limiter.tryAcquire("203.0.113.7");
        }

        RateLimitVerdict verdict = limiter.tryAcquire("203.0.113.7");

        assertThat(verdict.allowed()).isFalse();
        // La fenetre glisse : le creneau se libere quand la plus ancienne des
        // cinq sort de l'heure, donc dans un peu moins d'une heure.
        assertThat(verdict.retryAfter())
                .isGreaterThan(Duration.ofMinutes(59))
                .isLessThanOrEqualTo(Duration.ofHours(1));
    }

    @Test
    @DisplayName("Une demande acceptee ne porte aucun delai")
    void allowedVerdictCarriesNoDelay() {
        assertThat(new ContactRateLimiter().tryAcquire("203.0.113.7").retryAfter())
                .isZero();
    }

    @Test
    @DisplayName("Le quota est par IP : un abuseur ne bloque pas les autres visiteurs")
    void quotaIsPerAddress() {
        ContactRateLimiter limiter = new ContactRateLimiter();
        for (int attempt = 1; attempt <= 6; attempt++) {
            limiter.tryAcquire("203.0.113.7");
        }

        assertThat(limiter.tryAcquire("203.0.113.8").allowed()).isTrue();
    }
}
