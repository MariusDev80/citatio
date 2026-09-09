package com.citatio.u1communication;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Garde-fou sur le handler d'erreurs partage (common-libs), monte ici parce que
 * seul un module applicatif porte un contexte web.
 *
 * <p>Une premiere version du handler attrapait tout dans un
 * {@code @ExceptionHandler(Exception.class)} et rendait <b>500</b> sur une URL
 * inconnue comme sur une mauvaise methode. Ces trois tests verrouillent la
 * correction : les erreurs standard de Spring MVC gardent leur statut, et le
 * corps reste un Problem Details sans trace technique.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ApiExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("URL inconnue : 404, pas 500")
    void unknownPathAnswers404() throws Exception {
        mockMvc.perform(get("/api/u1/route-inexistante"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Methode non supportee : 405, pas 500")
    void wrongMethodAnswers405() throws Exception {
        mockMvc.perform(post("/api/u1/health"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405));
    }

    @Test
    @DisplayName("Aucune stack trace ne fuit dans le corps d'erreur")
    void errorBodyCarriesNoStackTrace() throws Exception {
        mockMvc.perform(get("/api/u1/route-inexistante"))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("com.citatio"))));
    }
}
