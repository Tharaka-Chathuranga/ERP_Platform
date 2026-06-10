package com.enlear.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Application entry point. Component scanning starts at {@code com.enlear.erp},
 * which transitively picks up every module (shared, user, store) since
 * they share that base package. New modules are wired in simply by adding the
 * Gradle dependency in {@code bootstrap/build.gradle.kts}.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class ErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(ErpApplication.class, args);
    }
}
