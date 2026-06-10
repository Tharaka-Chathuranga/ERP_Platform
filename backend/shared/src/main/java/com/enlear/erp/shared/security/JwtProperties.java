package com.enlear.erp.shared.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalised JWT settings. The secret MUST be supplied via configuration /
 * environment in any real environment — never hard-code it.
 *
 * @param secret           HMAC signing secret (min 32 bytes for HS256)
 * @param issuer           token issuer claim
 * @param expirationMinutes access-token lifetime in minutes
 */
@ConfigurationProperties(prefix = "erp.security.jwt")
public record JwtProperties(
        String secret,
        String issuer,
        long expirationMinutes
) {
    public JwtProperties {
        if (issuer == null) issuer = "erp-platform";
        if (expirationMinutes <= 0) expirationMinutes = 60;
    }
}
