export class StorageHandler {

    public getFrontendSocketUrl(): string {
        const socketUrl = this.getCookie("frontendSocketUrl");
        return socketUrl;
    }

    public getToken(): string {
        const token = this.getCookie('token');

        if (!token || token === "") {
            window.location.replace('/auth');
        }

        return token;
    }

    public getContextId(): string {
        const contextId = this.getCookie('contextId');
        return contextId;
    }

    public getCookie(name: string): string {
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

}

const ClientStorageHandler = new StorageHandler();

export {
    ClientStorageHandler
};
