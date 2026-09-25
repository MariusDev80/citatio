package com.citatio.u2blog.article;

import java.util.Arrays;
import java.util.Optional;

/**
 * Formats d'image acceptes pour la couverture d'un article, reconnus a leurs
 * premiers octets.
 *
 * <p>Le type annonce par le navigateur n'est pas lu : il vient de l'extension
 * du fichier, pas de son contenu. Or c'est ce type que l'API renverra en
 * {@code Content-Type} a chaque visiteur ; il doit donc decrire les octets
 * reellement stockes. SVG est ecarte pour la meme raison qu'ailleurs : c'est un
 * document qui peut porter du script, pas une image inerte.
 */
public enum ImageFormat {

    JPEG("image/jpeg"),
    PNG("image/png"),
    WEBP("image/webp");

    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};
    private static final byte[] RIFF = {'R', 'I', 'F', 'F'};
    private static final byte[] WEBP_TAG = {'W', 'E', 'B', 'P'};

    private final String mediaType;

    ImageFormat(String mediaType) {
        this.mediaType = mediaType;
    }

    public String mediaType() {
        return mediaType;
    }

    /** Format reconnu, ou vide si les octets ne sont ni du JPEG, ni du PNG, ni du WebP. */
    public static Optional<ImageFormat> detect(byte[] content) {
        if (startsWith(content, 0, JPEG_MAGIC)) {
            return Optional.of(JPEG);
        }
        if (startsWith(content, 0, PNG_MAGIC)) {
            return Optional.of(PNG);
        }
        // WebP : conteneur RIFF, taille sur quatre octets, puis la marque WEBP.
        if (startsWith(content, 0, RIFF) && startsWith(content, 8, WEBP_TAG)) {
            return Optional.of(WEBP);
        }
        return Optional.empty();
    }

    private static boolean startsWith(byte[] content, int offset, byte[] prefix) {
        return content.length >= offset + prefix.length
                && Arrays.equals(content, offset, offset + prefix.length, prefix, 0, prefix.length);
    }
}
