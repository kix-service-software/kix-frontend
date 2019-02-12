import { RequestObject } from '../../RequestObject';

export class CreateUser extends RequestObject {

    public UserLogin: string;
    public UserFirstname: string;
    public UserLastname: string;
    public UserEmail: string;
    public UserPassword: string;
    public UserPhone: string;
    public UserTitle: string;

    public constructor(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string
    ) {
        super();
        this.applyProperty('UserLogin', login);
        this.applyProperty('UserFirstname', firstName);
        this.applyProperty('UserLastname', lastName);
        this.applyProperty('UserEmail', email);
        this.applyProperty('UserPassword', password);
        this.applyProperty('UserPhone', phone);
        this.applyProperty('UserTitle', title);
    }
}
