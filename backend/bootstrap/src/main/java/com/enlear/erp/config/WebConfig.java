package com.enlear.erp.config;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the bundled React SPA from {@code classpath:/static/} on the same origin
 * as the API. Any path that does not resolve to a real static file and is not an
 * API / docs / actuator route falls back to {@code index.html}, so client-side
 * routes (e.g. deep links and browser refreshes on {@code /items}) work. The SPA
 * is only present in the jar when built via the Docker image, which copies the
 * Vite {@code dist/} output into static resources before packaging.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Resource INDEX = new ClassPathResource("/static/index.html");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        // Never hijack backend routes — let them 404/handle normally.
                        if (resourcePath.startsWith("api/")
                                || resourcePath.startsWith("v3/")
                                || resourcePath.startsWith("swagger")
                                || resourcePath.startsWith("actuator/")) {
                            return null;
                        }
                        // SPA client-side route -> serve the shell.
                        return INDEX.exists() ? INDEX : null;
                    }
                });
    }
}
