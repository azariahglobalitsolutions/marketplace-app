package com.wubebereha.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WubeBerehaApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void healthEndpointReturnsHealthyStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"))
                .andExpect(jsonPath("$.service").value("wube-bereha-habesha-events"));
    }

    @Test
    void categoriesEndpointReturnsFiveCategories() throws Exception {
        mockMvc.perform(get("/api/listings/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories.length()").value(5));
    }

    @Test
    void registerAndLoginFlowWorks() throws Exception {
        String registerBody = """
                {
                  "email": "tester@example.com",
                  "password": "secret123456",
                  "phone_country": "US"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("tester@example.com"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void advertiseTiersEndpointReturnsThreeTiers() throws Exception {
        mockMvc.perform(get("/api/advertise/tiers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tiers.length()").value(3));
    }
}
