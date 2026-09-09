package com.citatio.common.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Handler d'erreurs partage par les microservices, renvoyant des
 * <b>Problem Details RFC 7807</b> (cf. CLAUDE.md §4).
 *
 * <p>Importe explicitement via {@code @Import(ApiExceptionHandler.class)} dans
 * chaque application, comme {@code CommonWebConfig}.
 *
 * <p><b>Herite de {@link ResponseEntityExceptionHandler}, et ce n'est pas
 * cosmetique.</b> Une premiere version se contentait d'un
 * {@code @ExceptionHandler(Exception.class)} : ce filet attrapait aussi les
 * exceptions que Spring MVC leve lui-meme et qui portent deja le bon statut
 * ({@code NoResourceFoundException}, {@code HttpRequestMethodNotSupportedException},
 * {@code HttpMessageNotReadableException}...). Resultat mesure : toute URL
 * inconnue repondait <b>500</b> au lieu de 404, une mauvaise methode 500 au lieu
 * de 405, et chaque passage de robot ecrivait une stack trace en niveau ERROR.
 * La classe parente traduit ces exceptions en Problem Details avec leur statut
 * d'origine ; le filet final ci-dessous ne voit plus que ce qui est reellement
 * inattendu.
 *
 * <p>{@code @Order(LOWEST_PRECEDENCE)} : cet advice est un filet, il doit passer
 * apres tout advice plus specifique qu'un module ajouterait pour son metier.
 */
@Slf4j
@Order(Ordered.LOWEST_PRECEDENCE)
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Echec de validation d'un DTO annote {@code @Valid}.
     *
     * <p>Redefinit la methode de la classe parente au lieu de declarer un second
     * {@code @ExceptionHandler} pour le meme type : deux handlers concurrents
     * feraient echouer le demarrage sur un mapping ambigu.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException e,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Requete invalide");
        problem.setDetail(e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " : " + error.getDefaultMessage())
                .reduce((a, b) -> a + " ; " + b)
                .orElse("Champs invalides"));
        return ResponseEntity.badRequest().body(problem);
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
