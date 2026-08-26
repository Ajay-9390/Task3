package com.ghmc.portal.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import redis.embedded.RedisServer;

@Configuration
public class EmbeddedRedisConfig {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddedRedisConfig.class);

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    private RedisServer redisServer;

    @PostConstruct
    public void startRedis() {
        try {
            redisServer = new RedisServer(redisPort);
            redisServer.start();
            logger.info("⚡ Embedded In-Memory Redis Server STARTED successfully on port {}", redisPort);
        } catch (Exception e) {
            logger.warn("Embedded Redis server start skipped or already running on port {}: {}", redisPort, e.getMessage());
        }
    }

    @PreDestroy
    public void stopRedis() {
        if (redisServer != null && redisServer.isActive()) {
            try {
                redisServer.stop();
                logger.info("⚡ Embedded Redis Server stopped gracefully.");
            } catch (Exception e) {
                logger.error("Error stopping embedded Redis server:", e);
            }
        }
    }
}
