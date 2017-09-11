export class StorageHandler {

    public getFrontendSocketUrl(): string {
        const socketUrl = window.localStorage.getItem("frontendSocketUrl");
        return socketUrl;
    }

    public setFrontendSocketUrl(socketUrl: string) {
        window.localStorage.setItem("frontendSocketUrl", socketUrl);
    }

    public getToken(): string {
        const token = window.localStorage.getItem("token");

        if (!token || token === "") {
            window.location.replace('/auth');
        }

        return token;
    }

}

const LocalStorageHandler = new StorageHandler();

export {
    LocalStorageHandler
};
