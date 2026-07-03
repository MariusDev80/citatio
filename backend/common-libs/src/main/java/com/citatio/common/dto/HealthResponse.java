package com.citatio.common.dto;

import java.time.Instant;

/**
 * Reponse de sante partagee par tous les microservices.
 * Sert aussi de preuve que common-libs est bien partage entre les modules.
 *
 * @param service   nom du microservice (ex: "u1-communication")
 * @param status    etat du service (ex: "UP")
 * @param timestamp instant de la reponse
 */
public record HealthResponse(String service, String status, Instant timestamp) {

    /** Fabrique une reponse "UP" horodatee a l'instant courant. */
    public static HealthResponse up(String service) {
        return new HealthResponse(service, "UP", Instant.now());
    }
}
