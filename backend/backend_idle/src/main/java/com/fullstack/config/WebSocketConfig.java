package com.fullstack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker // 웹소켓 메시지 브로커를 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic"으로 시작하는 메시지는 메시지 브로커가 처리하도록 설정
        // 브로커는 해당 토픽을 구독한 모든 클라이언트에게 메시지를 전달
        config.enableSimpleBroker("/topic");

        // "/app"으로 시작하는 메시지는 @MessageMapping 어노테이션이 붙은 컨트롤러로 라우팅
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 웹소켓 연결을 위한 STOMP 엔드포인트를 등록
        // 클라이언트는 이 경로("/ws")로 웹소켓 연결을 시도
        // .withSockJS()는 웹소켓을 지원하지 않는 브라우저를 위해 SockJS 폴백 옵션을 활성화
        registry.addEndpoint("/ws").setAllowedOriginPatterns("http://localhost:3000", "https://idle-react-project-front.onrender.com").withSockJS();
    }
}
