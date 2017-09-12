export class StorageHandler {

    public getFrontendSocketUrl(): string {
        const socketUrl = window.localStorage.getItem("frontendSocketUrl");
        return socketUrl;
    }

    public setFrontendSocketUrl(socketUrl: string) {
        window.localStorage.setItem("frontendSocketUrl", socketUrl);
    }

    public getToken(): string {
        const token = this.getCookie('token');

        if (!token || token === "") {
            window.location.replace('/auth');
        }

        return token;
    }

    public getCookie(name: string): string {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
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
