package com.citatio.u1communication.api;

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

@WebMvcTest(PingU2Controller.class)
@TestPropertySource(properties = "u2.base-url=http://localhost:8082")
class PingU2ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UpstreamClient u2Client;

    @Test
    @DisplayName("u2 joignable : 200 + REACHABLE avec la sante de u2")
    void returnsReachableWhenU2Responds() throws Exception {
        given(u2Client.fetchHealth(anyString()))
                .willReturn(UpstreamStatus.reachable("u2-blog", HealthResponse.up("u2-blog")));

        mockMvc.perform(get("/api/u1/ping-u2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("REACHABLE"))
                .andExpect(jsonPath("$.service").value("u2-blog"))
                .andExpect(jsonPath("$.payload.status").value("UP"));
    }

    @Test
    @DisplayName("u2 coupe : 200 + UNREACHABLE, surtout pas 500")
    void returnsUnreachableWithoutFailingWhenU2IsDown() throws Exception {
        given(u2Client.fetchHealth(anyString()))
                .willReturn(UpstreamStatus.unreachable("u2-blog", "Connection refused"));

        mockMvc.perform(get("/api/u1/ping-u2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("UNREACHABLE"))
                .andExpect(jsonPath("$.payload").doesNotExist())
                .andExpect(jsonPath("$.detail").value("Connection refused"));
    }
}
