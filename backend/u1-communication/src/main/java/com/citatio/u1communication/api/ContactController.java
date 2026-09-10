package com.citatio.u1communication.api;

import com.citatio.u1communication.contact.ContactRateLimitExceededException;
import com.citatio.u1communication.contact.ContactRateLimiter;
import com.citatio.u1communication.contact.ContactRequestService;
import com.citatio.u1communication.contact.ContactSubmission;
import com.citatio.u1communication.contact.RateLimitVerdict;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Reception des demandes du formulaire de contact du site.
 *
 * <p>Sous {@code /api/u1}, prefixe conserve par la gateway ({@code handle} et
 * non {@code handle_path}), ressource au pluriel comme le veut CLAUDE.md §4.2.
 *
 * <p><b>202 et non 201</b> : la demande est acceptee et enregistree, mais la
 * notification qui compte pour nous part apres la reponse. Promettre un 201
 * "cree" sur une ressource que le client ne peut pas relire, ou un 200 qui
 * laisserait croire que le mail est arrive, serait imprecis dans les deux cas.
 * Aucun corps : le client n'a rien a lire, et le contenu de la base ne sort pas.
 */
@RestController
@RequestMapping("/api/u1")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRequestService contactRequestService;
    private final ContactRateLimiter rateLimiter;

    @PostMapping("/contact-requests")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void submit(@Valid @RequestBody ContactSubmission submission,
                       HttpServletRequest request) {

        String clientIp = ClientIpResolver.resolve(request);

        RateLimitVerdict verdict = rateLimiter.tryAcquire(clientIp);
        if (!verdict.allowed()) {
            // L'exception porte son Retry-After : ApiExceptionHandler, via sa
            // classe parente, en fait un Problem Details 429 avec l'en-tete.
            throw new ContactRateLimitExceededException(verdict.retryAfter());
        }

        contactRequestService.submit(submission, clientIp);
    }
}
