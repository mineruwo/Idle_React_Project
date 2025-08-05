const getWebSocketUrl = () => {
    return process.env.REACT_APP_WEBSOCKET_URL;
};

const getApiBaseUrl = () => {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'; // 기본값 설정
};

export const apiConfig = {
    webSocketUrl: getWebSocketUrl(),
    apiBaseUrl: getApiBaseUrl(),
};