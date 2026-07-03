package com.citatio.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration CORS partagee par les microservices, importee explicitement
 * via {@code @Import(CommonWebConfig.class)} dans chaque application.
 *
 * <p>TODO: restreindre {@code allowedOrigins} a l'URL de production
 * (actuellement ouvert pour faciliter le developpement).
 */
@Configuration
public class CommonWebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // En production, on mettra l'URL precise
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}
