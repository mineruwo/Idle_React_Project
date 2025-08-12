export const ACCESS_TOKEN_KEY = "accessToken";
export const AUTH_CHANGE_EVENT = "auth-change";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    // GNB가 반응
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
} 

export const clearAccessToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
} 