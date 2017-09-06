export class User {

    public firstName: string;

    public lastName: string;

    public email: string;

    public constructor(firstName: string = "", lastName: string = "", email: string = "") {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

}
