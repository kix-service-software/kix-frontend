export class SaveConfigurationRequest {

    public configuration: any;

    public token: string;

    public contextId: string;

    public componentId: string;

    public userSpecific: boolean;

    public constructor(
        configuration: any, token: string, contextId: string, componentId: string, userSpecific: boolean) {
        this.configuration = configuration;
        this.token = token;
        this.contextId = contextId;
        this.userSpecific = userSpecific;
    }

}
