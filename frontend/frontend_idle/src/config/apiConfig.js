const getWebSocketUrl = () => {
    return process.env.REACT_APP_WEBSOCKET_URL;
};

export const apiConfig = {
    webSocketUrl: getWebSocketUrl(),
};
