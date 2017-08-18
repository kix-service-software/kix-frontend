export class CreateUser {

    public UserLogin: string;

    public UserFirstname: string;

    public UserLastname: string;

    public UserEmail: string;

    public UserPassword: string;

    public UserPhone: string;

    public UserTitle: string;

    public constructor(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string) {

        this.UserLogin = login;
        this.UserFirstname = firstName;
        this.UserLastname = lastName;
        this.UserEmail = email;
        this.UserPassword = password;
        this.UserPhone = phone;
        this.UserTitle = title;
    }
}
