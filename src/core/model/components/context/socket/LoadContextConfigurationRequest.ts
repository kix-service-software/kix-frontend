export class LoadContextConfigurationRequest {

    public token: string;

    public contextId: string;

    public constructor(token: string, contextId: string) {

        this.token = token;
        this.contextId = contextId;
    }

}
