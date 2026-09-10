package com.citatio.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration CORS partagee par les microservices, importee explicitement
 * via {@code @Import(CommonWebConfig.class)} dans chaque application.
 *
 * <p><b>Les origines sont fermees.</b> La version precedente autorisait
 * {@code allowedOrigins("*")}, ce qui laissait n'importe quelle page du web
 * appeler l'API depuis le navigateur d'un visiteur. C'etait une commodite de
 * developpement restee en place, et CLAUDE.md §12 la listait comme dette a
 * solder avant qu'une API soit reellement consommee.
 *
 * <p>En production le sujet est d'ailleurs theorique : le frontend est servi par
 * la meme gateway Caddy que {@code /api/uX}, donc sur la <b>meme origine</b>, et
 * une requete de meme origine ne declenche aucun controle CORS. La liste ne sert
 * qu'aux cas hors production, d'ou la variable d'environnement.
 *
 * <p>Developpement local avec le serveur Angular : lancer les microservices avec
 * {@code CORS_ALLOWED_ORIGINS=http://localhost:4200}. Cette origine n'est
 * volontairement pas dans la valeur par defaut, pour que la configuration livree
 * en production ne contienne que la production.
 */
@Configuration
public class CommonWebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    /**
     * Constructeur explicite plutot que {@code @RequiredArgsConstructor} : la
     * recopie de {@code @Value} d'un champ vers le parametre genere depend de la
     * configuration Lombok, et une origine silencieusement nulle ouvrirait ou
     * casserait le CORS sans prevenir. Ici, le cablage se lit.
     */
    public CommonWebConfig(@Value("${citatio.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Par defaut, un navigateur ne laisse lire d'une reponse
                // cross-origin que six en-teles simples : tout le reste est
                // present sur le reseau mais invisible au JavaScript. Retry-After
                // sert au formulaire de contact a dire quand renvoyer un message
                // apres un 429 ; sans cette ligne il serait silencieusement nul,
                // et la page retomberait sur un "reessayez plus tard" vague.
                .exposedHeaders(HttpHeaders.RETRY_AFTER)
                // Aucun cookie ni en-tete d'authentification n'est echange
                // aujourd'hui : laisser les identifiants fermes evite d'avoir a y
                // repenser le jour ou une origine serait ajoutee a la liste.
                .allowCredentials(false);
    }
}
