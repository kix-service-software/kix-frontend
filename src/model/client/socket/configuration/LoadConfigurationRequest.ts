export class LoadConfigurationRequest {

    public token: string;

    public configurationName: string;

    public userSpecific: boolean;

    public constructor(token: string, configurationName: string, userSpecific: boolean = false) {
        this.token = token;
        this.configurationName = configurationName;
        this.userSpecific = userSpecific;
    }

}
