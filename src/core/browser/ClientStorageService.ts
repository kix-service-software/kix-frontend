export class ClientStorageService {

    private static INSTANCE: ClientStorageService = null;

    public static getInstance(): ClientStorageService {
        if (!ClientStorageService.INSTANCE) {
            ClientStorageService.INSTANCE = new ClientStorageService();
        }

        return ClientStorageService.INSTANCE;
    }

    public static getFrontendSocketUrl(): string {
        const socketUrl = ClientStorageService.getCookie("frontendSocketUrl");
        return socketUrl;
    }

    public static getToken(): string {
        const token = ClientStorageService.getCookie('token');

        if (!token || token === "") {
            window.location.replace('/auth');
        }

        return token;
    }

    public static destroyToken(): void {
        document.cookie = "token=; expires=" + new Date();
    }

    public static getCookie(name: string): string {
        const nameEQ = name + "=";
        const ca = decodeURIComponent(document.cookie).split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    public static loadState<T>(id: string): T {
        try {
            const serializedState = window.localStorage.getItem(id);
            return serializedState ? JSON.parse(serializedState) : undefined;
        } catch (err) {
            return undefined;
        }
    }

    public static saveState<T>(id: string, state: T): void {
        try {
            const serializedState = JSON.stringify(state);
            window.localStorage.setItem(id, serializedState);
        } catch (error) {
            console.error(error);
        }
    }

    public static deleteState(id: string): void {
        window.localStorage.removeItem(id);
    }

    public static setOption(key: string, value: string): void {
        window.localStorage.setItem(key, value);
    }

    public static getOption(key: string): string {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
        }
        return null;
    }

}
