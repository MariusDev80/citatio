package com.citatio.u2blog.article;

/** Image prete a etre servie : ses octets et le type a annoncer. */
public record ArticleImageView(byte[] content, String mediaType) {
}
