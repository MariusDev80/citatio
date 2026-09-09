package com.citatio.u1communication.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.citatio.common.web.ApiExceptionHandler;
import com.citatio.u1communication.contact.ContactRateLimiter;
import com.citatio.u1communication.contact.ContactRequestService;
import com.citatio.u1communication.contact.ContactSubmission;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Contrat HTTP de la reception du formulaire de contact.
 *
 * <p>{@code ApiExceptionHandler} est importe explicitement : sans lui, un
 * {@code @WebMvcTest} ne monte pas l'advice de common-libs et les cas d'erreur
 * ne renverraient pas de Problem Details, donc ces tests ne verifieraient pas
 * ce que le frontend recoit reellement.
 */
@WebMvcTest(ContactController.class)
@Import(ApiExceptionHandler.class)
class ContactControllerTest {

    private static final String ENDPOINT = "/api/u1/contact-requests";

    private static final String VALID_BODY = """
            {
              "name": "Camille Roy",
              "email": "camille.roy@example.test",
              "company": "Boulangerie Roy",
              "projectType": "Création d’un premier site",
              "budget": "De 1 500 à 2 500 €",
              "deadline": "Dans les 3 mois",
              "message": "Nous voudrions un site vitrine avec nos horaires et nos produits.",
              "consent": true,
              "website": ""
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactRequestService contactRequestService;

    @MockitoBean
    private ContactRateLimiter rateLimiter;

    @BeforeEach
    void allowByDefault() {
        given(rateLimiter.tryAcquire(anyString())).willReturn(true);
    }

    @Test
    @DisplayName("Demande valide : 202 sans corps, transmise au service")
    void validSubmissionIsAccepted() throws Exception {
        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isAccepted())
                .andExpect(content -> org.assertj.core.api.Assertions
                        .assertThat(content.getResponse().getContentAsString()).isEmpty());

        verify(contactRequestService).submit(any(ContactSubmission.class), anyString());
    }

    @Test
    @DisplayName("Champs manquants : 400 en Problem Details, rien n'atteint le service")
    void invalidSubmissionIsRejected() throws Exception {
        String incomplete = """
                {
                  "name": "A",
                  "email": "pas-une-adresse",
                  "projectType": "",
                  "message": "trop court",
                  "consent": true
                }
                """;

        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(incomplete))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Requete invalide"))
                .andExpect(jsonPath("$.detail").exists());

        verify(contactRequestService, never()).submit(any(), anyString());
    }

    @Test
    @DisplayName("Consentement RGPD refuse : 400, la demande n'est pas enregistree")
    void refusedConsentIsRejected() throws Exception {
        String withoutConsent = VALID_BODY.replace("\"consent\": true", "\"consent\": false");

        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(withoutConsent))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("consentement")));

        verify(contactRequestService, never()).submit(any(), anyString());
    }

    @Test
    @DisplayName("Consentement RGPD absent du corps : 400 nommant le champ, pas une erreur de parsing")
    void missingConsentIsRejected() throws Exception {
        String withoutConsent = VALID_BODY.replace("\"consent\": true,", "");

        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(withoutConsent))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Requete invalide"))
                .andExpect(jsonPath("$.detail").value(
                        org.hamcrest.Matchers.containsString("consentement")));

        verify(contactRequestService, never()).submit(any(), anyString());
    }

    @Test
    @DisplayName("Leurre rempli : 202 comme une demande normale, le tri se fait plus bas")
    void honeypotStillAnswers202() throws Exception {
        String botBody = VALID_BODY.replace("\"website\": \"\"", "\"website\": \"https://spam.example.test\"");

        // Le controleur ne discrimine pas : repondre 400 ici apprendrait au
        // robot quel champ laisser vide. Le service ecarte la demande en silence.
        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(botBody))
                .andExpect(status().isAccepted());

        verify(contactRequestService).submit(any(ContactSubmission.class), anyString());
    }

    @Test
    @DisplayName("Quota depasse : 429, rien n'est enregistre")
    void rateLimitedSubmissionIsRefused() throws Exception {
        given(rateLimiter.tryAcquire(anyString())).willReturn(false);

        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));

        verify(contactRequestService, never()).submit(any(), anyString());
    }

    @Test
    @DisplayName("Derriere la gateway, l'IP retenue est celle ajoutee par Caddy, pas celle du client")
    void clientIpComesFromTheLastForwardedHop() throws Exception {
        // Un robot peut prefixer X-Forwarded-For de ce qu'il veut pour se donner
        // une IP neuve a chaque envoi. Seule la derniere valeur est ecrite par
        // notre proxy, c'est donc celle qui compte pour la limite.
        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY)
                        .header("X-Forwarded-For", "10.0.0.1, 198.51.100.42"))
                .andExpect(status().isAccepted());

        verify(rateLimiter).tryAcquire("198.51.100.42");
        verify(contactRequestService).submit(any(ContactSubmission.class), eq("198.51.100.42"));
    }
}
