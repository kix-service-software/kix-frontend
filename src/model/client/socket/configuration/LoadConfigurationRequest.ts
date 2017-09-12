export class LoadConfigurationRequest {

    public token: string;

    public contextId: string;

    public componentId: string;

    public userSpecific: boolean;

    public constructor(token: string, contextId: string, componentId: string, userSpecific: boolean = false) {
        this.token = token;
        this.contextId = contextId;
        this.componentId = componentId;
        this.userSpecific = userSpecific;
    }

}
