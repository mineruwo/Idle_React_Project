const getWebSocketUrl = () => {
    return process.env.REACT_APP_WEBSOCKET_URL;
};

const getApiBaseUrl = () => {
    return process.env.REACT_APP_API_BASE_URL;
};

export const apiConfig = {
    webSocketUrl: getWebSocketUrl(),
    apiBaseUrl: getApiBaseUrl(),
};