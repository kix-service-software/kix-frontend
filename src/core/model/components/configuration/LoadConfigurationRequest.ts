export class LoadConfigurationRequest {

    public token: string;

    public contextId: string;

    public componentId: string;

    public instanceId: string;

    public userSpecific: boolean;

    public constructor(
        token: string,
        contextId: string, componentId: string, instanceId: string,
        userSpecific: boolean = false) {

        this.token = token;
        this.contextId = contextId;
        this.componentId = componentId;
        this.instanceId = instanceId;
        this.userSpecific = userSpecific;
    }

}
