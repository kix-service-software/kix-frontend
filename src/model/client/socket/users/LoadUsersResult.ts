import { UIProperty } from './../../UIProperty';
export class LoadUsersResult {

    public properties: UIProperty[];

    public users: any[];

    public constructor(properties: UIProperty[], users: any[] = []) {
        this.properties = properties;
        this.users = users;
    }

}
