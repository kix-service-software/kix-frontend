export class LoadWidgetRequest {

    public token: string;

    public contextId: string;

    public componentId: string;

    public instanceId: string;

    public userSpecific: boolean;

    constructor(token: string, contextId: string, componentId: string, instanceId: string, userSpecific?: boolean) {
        this.token = token;
        this.contextId = contextId;
        this.componentId = componentId;
        this.instanceId = instanceId;
        this.userSpecific = userSpecific;
    }
}
