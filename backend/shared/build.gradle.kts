// shared ── cross-cutting building blocks reused by every module:
// base JPA entity + auditing, domain primitives, error handling (RFC-7807),
// and JWT security plumbing. This is a plain library (not bootable).
//
// Dependencies are exposed with `api` so downstream modules inherit them.

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    api("org.springframework.boot:spring-boot-starter-web")
    api("org.springframework.boot:spring-boot-starter-security")
    api("org.springframework.boot:spring-boot-starter-validation")

    val jjwt = property("jjwtVersion")
    api("io.jsonwebtoken:jjwt-api:$jjwt")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:$jjwt")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jjwt")
}
