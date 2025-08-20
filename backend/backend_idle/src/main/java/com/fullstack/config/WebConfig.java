// com.fullstack.config.WebConfig
package com.fullstack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration is managed in SecurityConfig.java
}