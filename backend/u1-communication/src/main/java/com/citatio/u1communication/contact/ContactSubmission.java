package com.citatio.u1communication.contact;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Demande de contact telle qu'elle arrive du formulaire Angular.
 *
 * <p>Les champs sont ceux du formulaire existant (page /contact), sans ajout ni
 * renommage : {@code name}, {@code email}, {@code company}, {@code projectType},
 * {@code budget}, {@code deadline}, {@code message}. Les deux derniers sont les
 * seuls apports du passage a l'envoi serveur.
 *
 * <p>Les bornes hautes ne sont pas decoratives : elles bornent aussi ce qui part
 * dans le mail et ce qui est ecrit en base, donc ce qu'un robot peut y injecter.
 *
 * @param consent consentement RGPD, obligatoire. Sans lui la demande est refusee
 *                en 400 : c'est une case a cocher, pas une case pre-cochee.
 *                <b>Boolean et non boolean</b> : sur un primitif, un champ absent
 *                du JSON fait echouer la deserialisation avant meme la validation,
 *                et le client recoit un "Failed to read request" au lieu de savoir
 *                quel champ manque. Boxe, l'absence devient un @NotNull lisible.
 * @param website leurre (honeypot). Un visiteur ne le voit pas et le laisse vide ;
 *                un robot qui remplit tous les champs le remplit. Volontairement
 *                <b>sans contrainte de validation</b> : un 400 apprendrait au
 *                spammeur que le piege existe. Le tri se fait dans le service.
 */
public record ContactSubmission(

        @NotBlank(message = "le nom est obligatoire")
        @Size(min = 2, max = 120, message = "le nom doit faire entre 2 et 120 caracteres")
        String name,

        @NotBlank(message = "l'email est obligatoire")
        @Email(message = "l'email n'est pas une adresse valide")
        @Size(max = 254, message = "l'email depasse la longueur maximale d'une adresse")
        String email,

        @Size(max = 160, message = "le nom d'entreprise depasse 160 caracteres")
        String company,

        @NotBlank(message = "le type de projet est obligatoire")
        @Size(max = 80, message = "le type de projet depasse 80 caracteres")
        String projectType,

        @Size(max = 80, message = "le budget depasse 80 caracteres")
        String budget,

        @Size(max = 80, message = "l'echeance depasse 80 caracteres")
        String deadline,

        @NotBlank(message = "le message est obligatoire")
        @Size(min = 20, max = 5000, message = "le message doit faire entre 20 et 5000 caracteres")
        String message,

        // Les deux contraintes sont necessaires : @AssertTrue tient null pour
        // valide (regle Bean Validation), donc seul @NotNull attrape l'absence.
        @NotNull(message = "le consentement est obligatoire")
        @AssertTrue(message = "le consentement est obligatoire")
        Boolean consent,

        String website) {

    /** Vrai si le leurre a ete rempli, donc si l'emetteur n'est pas un humain. */
    public boolean looksAutomated() {
        return website != null && !website.isBlank();
    }

    /** Consentement effectif, null compris (une demande validee est toujours a true). */
    public boolean consentGiven() {
        return Boolean.TRUE.equals(consent);
    }
}
