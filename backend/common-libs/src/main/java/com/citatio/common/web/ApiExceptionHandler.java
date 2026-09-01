package com.citatio.common.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

/**
 * Handler d'erreurs partage par les microservices, renvoyant des
 * <b>Problem Details RFC 7807</b> (cf. CLAUDE.md §4).
 *
 * <p>Importe explicitement via {@code @Import(ApiExceptionHandler.class)} dans
 * chaque application, comme {@code CommonWebConfig}.
 *
 * <p>Filet de securite : les appels inter-modules passent par
 * {@link com.citatio.common.client.UpstreamClient} qui absorbe deja les pannes
 * d'upstream. Ce handler couvre le reste et evite toute fuite de stack trace.
 */
@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {

    /** Echec de validation d'un DTO annote {@code @Valid}. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException e) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Requete invalide");
        problem.setDetail(e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " : " + error.getDefaultMessage())
                .reduce((a, b) -> a + " ; " + b)
                .orElse("Champs invalides"));
        return problem;
    }

    /** Appel inter-modules non protege par UpstreamClient : l'upstream est indisponible. */
    @ExceptionHandler(RestClientException.class)
    public ProblemDetail handleUpstreamFailure(RestClientException e) {
        log.warn("Appel upstream en echec : {}", e.getMessage());
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.SERVICE_UNAVAILABLE);
        problem.setTitle("Service amont indisponible");
        problem.setDetail("Un microservice appele n'a pas repondu.");
        return problem;
    }

    /** Filet final : on loggue la cause reelle mais on n'expose rien au client. */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception e) {
        log.error("Erreur inattendue", e);
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("Erreur interne");
        problem.setDetail("Une erreur inattendue est survenue.");
        return problem;
    }
}
