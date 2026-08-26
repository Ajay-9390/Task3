package com.ghmc.portal.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Multi-Tenancy Interceptor.
 * Extracts the 'X-Zone-Id' header from incoming HTTP requests to isolate data per GHMC Zone.
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    public static final String TENANT_HEADER = "X-Zone-Id";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String zoneId = request.getHeader(TENANT_HEADER);
        if (zoneId != null && !zoneId.isBlank()) {
            TenantContext.setCurrentTenant(zoneId.toUpperCase());
        } else {
            // Default tenant if header is absent
            TenantContext.setCurrentTenant("KHAIRATABAD");
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Crucial to clear ThreadLocal memory to avoid leaks in Tomcat thread pool
        TenantContext.clear();
    }
}
