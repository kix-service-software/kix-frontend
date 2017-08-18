export class UpdateUserRequest {

    public User: any;

    public constructor(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number) {

        this.User = {};

        this.applyProperty('UserLogin', login);
        this.applyProperty('UserFirstname', firstName);
        this.applyProperty('UserLastname', lastName);
        this.applyProperty('UserEmail', email);
        this.applyProperty('UserPassword', password);
        this.applyProperty('UserPhone', phone);
        this.applyProperty('UserTitle', title);
        this.applyProperty('ValidID', valid);
    }

    private applyProperty(name: string, value: any): void {
        if (value) {
            this.User[name] = value;
        }
    }

}
