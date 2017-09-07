import { UIProperty } from './../../UIProperty';
export class LoadUsersRequest {

    public token: string;

    public configName: string;

    public properties: UIProperty[];

    public limit: number;

    public constructor(token: string, configName: string, properties: UIProperty[], limit: number) {
        this.token = token;
        this.configName = configName;
        this.properties = properties;
        this.limit = limit;
    }
}
