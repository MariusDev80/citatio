package com.citatio.u2blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Horloge injectee plutot que {@code Instant.now()} en dur : un test peut
 * publier deux articles a des dates connues et verifier leur ordre, sans
 * attendre ni dependre de la precision de l'horloge systeme.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
