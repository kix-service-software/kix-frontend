export class LoadUsersRequest {

    public token: string;

    public configName: string;

    public constructor(token: string, configName: string) {
        this.token = token;
        this.configName = configName;
    }
}
