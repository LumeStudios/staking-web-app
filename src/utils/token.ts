import axios from "axios";

const createAuthService = (ACCESS_TOKEN_KEY: string) => ({
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken(token: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    removeAccessToken(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    setAuthorizationHeader(token: string): void {
        axios.defaults.headers.common.authentication = token
    },

    removeAuthorizationHeader(): void {
        delete axios.defaults.headers.common.authentication;
    },

    logout(): void {
        this.removeAccessToken();
        this.removeAuthorizationHeader();
    },
});

export default class Auth {
    static user = createAuthService('USER_ACCESS_TOKEN');
}
