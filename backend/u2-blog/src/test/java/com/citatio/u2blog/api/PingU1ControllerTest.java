package com.citatio.u2blog.api;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.citatio.common.client.UpstreamClient;
import com.citatio.common.dto.HealthResponse;
import com.citatio.common.dto.UpstreamStatus;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PingU1Controller.class)
@TestPropertySource(properties = "u1.base-url=http://localhost:8081")
class PingU1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UpstreamClient u1Client;

    @Test
    @DisplayName("u1 joignable : 200 + REACHABLE avec la sante de u1")
    void returnsReachableWhenU1Responds() throws Exception {
        given(u1Client.fetchHealth(anyString()))
                .willReturn(UpstreamStatus.reachable("u1-communication", HealthResponse.up("u1-communication")));

        mockMvc.perform(get("/api/u2/ping-u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("REACHABLE"))
                .andExpect(jsonPath("$.service").value("u1-communication"))
                .andExpect(jsonPath("$.payload.status").value("UP"));
    }

    @Test
    @DisplayName("u1 coupe : 200 + UNREACHABLE, surtout pas 500")
    void returnsUnreachableWithoutFailingWhenU1IsDown() throws Exception {
        given(u1Client.fetchHealth(anyString()))
                .willReturn(UpstreamStatus.unreachable("u1-communication", "Connection refused"));

        mockMvc.perform(get("/api/u2/ping-u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("UNREACHABLE"))
                .andExpect(jsonPath("$.payload").doesNotExist())
                .andExpect(jsonPath("$.detail").value("Connection refused"));
    }
}
