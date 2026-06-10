package com.enlear.erp.config;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.orm.jpa.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

/**
 * Per-module database migrations. Each module owns a dedicated Postgres schema
 * and its OWN Flyway history table, so modules can version their migrations
 * independently (each starts at V1) without cross-module ordering conflicts.
 *
 * <p>Spring Boot's single auto-configured Flyway is disabled
 * ({@code spring.flyway.enabled=false}); we run one pipeline per schema here.
 * The {@link JpaDependsOnFlyway} post-processor guarantees all migrations
 * complete before Hibernate validates the mapping.
 */
@Configuration
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway iamFlyway(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .schemas("iam")
                .defaultSchema("iam")
                .locations("classpath:db/migration/iam")
                .baselineOnMigrate(true)
                .load();
    }

    @Bean(initMethod = "migrate")
    @DependsOn("iamFlyway")
    public Flyway storeFlyway(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .schemas("store")
                .defaultSchema("store")
                .locations("classpath:db/migration/store")
                .baselineOnMigrate(true)
                .load();
    }

    /** Forces the JPA EntityManagerFactory to wait until migrations have run. */
    @Configuration
    static class JpaDependsOnFlyway extends EntityManagerFactoryDependsOnPostProcessor {
        JpaDependsOnFlyway() {
            super("iamFlyway", "storeFlyway");
        }
    }
}
