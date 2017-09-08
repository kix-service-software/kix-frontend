export class SaveConfigurationRequest {

    public configuration: any;

    public token: string;

    public configurationName: string;

    public userSpecific: boolean;

    public constructor(configuration: any, token: string, configurationName: string, userSpecific: boolean) {
        this.configuration = configuration;
        this.token = token;
        this.configurationName = configurationName;
        this.userSpecific = userSpecific;
    }

}
