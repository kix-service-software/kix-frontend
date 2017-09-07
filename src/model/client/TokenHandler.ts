export class ClientTokenHandler {

    public getToken(): string {
        const token = window.localStorage.getItem("token");

        if (!token || token === "") {
            window.location.replace('/auth');
        }

        return token;
    }

}

const TokenHandler = new ClientTokenHandler();

export {
    TokenHandler
};
