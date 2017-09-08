import { UIProperty } from './../../UIProperty';
export class LoadUsersRequest {

    public token: string;

    public properties: UIProperty[];

    public limit: number;

    public constructor(token: string, properties: UIProperty[], limit: number) {
        this.token = token;
        this.properties = properties;
        this.limit = limit;
    }
}
