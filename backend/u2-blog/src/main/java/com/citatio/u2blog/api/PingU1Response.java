package com.citatio.u2blog.api;

import com.citatio.common.dto.HealthResponse;

/**
 * Resultat d'un appel inter-modules u2 -> u1.
 *
 * @param caller   le service appelant (u2-blog)
 * @param upstream la reponse de sante renvoyee par u1-communication
 */
public record PingU1Response(String caller, HealthResponse upstream) {
}
