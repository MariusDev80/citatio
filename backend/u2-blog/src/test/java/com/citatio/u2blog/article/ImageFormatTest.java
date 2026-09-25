package com.citatio.u2blog.article;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

class ImageFormatTest {

    /** Premiers octets reels de chaque format, suivis de remplissage. */
    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 13};
    static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 16};
    static final byte[] WEBP = {'R', 'I', 'F', 'F', 36, 0, 0, 0, 'W', 'E', 'B', 'P', 'V', 'P', '8', ' '};

    @Test
    @DisplayName("JPEG, PNG et WebP reconnus a leurs octets")
    void detectsSupportedFormats() {
        assertThat(ImageFormat.detect(JPEG)).contains(ImageFormat.JPEG);
        assertThat(ImageFormat.detect(PNG)).contains(ImageFormat.PNG);
        assertThat(ImageFormat.detect(WEBP)).contains(ImageFormat.WEBP);
    }

    @Test
    @DisplayName("Un SVG est refuse, quel que soit le nom du fichier")
    void rejectsSvg() {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><script/></svg>"
                .getBytes(StandardCharsets.UTF_8);

        assertThat(ImageFormat.detect(svg)).isEmpty();
    }

    @Test
    @DisplayName("Un conteneur RIFF qui n'est pas du WebP est refuse")
    void rejectsOtherRiffFiles() {
        byte[] wav = {'R', 'I', 'F', 'F', 36, 0, 0, 0, 'W', 'A', 'V', 'E'};

        assertThat(ImageFormat.detect(wav)).isEmpty();
    }

    @Test
    @DisplayName("Fichier trop court : refuse sans erreur")
    void rejectsTruncatedContent() {
        assertThat(ImageFormat.detect(new byte[] {(byte) 0xFF})).isEmpty();
        assertThat(ImageFormat.detect(new byte[0])).isEmpty();
    }
}
