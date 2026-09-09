package com.citatio.u1communication.contact;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Garde-fou anti-abus : 5 demandes par heure et par IP, comptees separement. */
class ContactRateLimiterTest {

    @Test
    @DisplayName("Cinq demandes passent, la sixieme est refusee")
    void allowsFivePerHourThenRefuses() {
        ContactRateLimiter limiter = new ContactRateLimiter();

        for (int attempt = 1; attempt <= 5; attempt++) {
            assertThat(limiter.tryAcquire("203.0.113.7"))
                    .as("demande n°%d", attempt)
                    .isTrue();
        }
        assertThat(limiter.tryAcquire("203.0.113.7")).isFalse();
    }

    @Test
    @DisplayName("Le quota est par IP : un abuseur ne bloque pas les autres visiteurs")
    void quotaIsPerAddress() {
        ContactRateLimiter limiter = new ContactRateLimiter();
        for (int attempt = 1; attempt <= 6; attempt++) {
            limiter.tryAcquire("203.0.113.7");
        }

        assertThat(limiter.tryAcquire("203.0.113.8")).isTrue();
    }
}
