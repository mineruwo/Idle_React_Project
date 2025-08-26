package com.fullstack.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ChatChannelInterceptor chatChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커 설정
        registry.enableSimpleBroker("/topic"); // /topic으로 시작하는 주소를 구독하는 클라이언트에게 메시지 전달
        registry.setApplicationDestinationPrefixes("/app"); // /app으로 시작하는 주소로 들어온 메시지를 @MessageMapping이 붙은 메서드로 라우팅
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP 엔드포인트 설정
        registry.addEndpoint("/ws-chat").setAllowedOriginPatterns("http://localhost:3000", "https://idle-react-project-front.onrender.com", "http://localhost:8080").withSockJS();
        registry.addEndpoint("/ws").setAllowedOriginPatterns("http://localhost:3000", "https://idle-react-project-front.onrender.com", "http://localhost:8080").withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // 위에서 만든 커스텀 인터셉터를 등록
        registration.interceptors(chatChannelInterceptor);
    }
}
