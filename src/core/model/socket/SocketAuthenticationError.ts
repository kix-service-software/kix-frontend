export class SocketAuthenticationError implements Error {

    public name: string;

    public message: string;

    public constructor(error: string) {
        this.name = "SocketAuthenticationError";
        this.message = error;
    }
}
