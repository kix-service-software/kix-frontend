export class LoadUsersRequest {

    public limit: number;

    public token: string;

    public constructor(token: string, limit: number = -1) {
        this.limit = limit;
        this.token = token;
    }
}
