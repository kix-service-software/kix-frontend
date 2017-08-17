export class UpdateUserRequest {

    public User: any;

    public constructor(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number) {

        this.User = {};

        if (login) {
            this.User = {
                ...this.User,
                UserLogin: login
            };
        }

        if (firstName) {
            this.User = {
                ...this.User,
                UserFirstname: firstName
            };
        }

        if (lastName) {
            this.User = {
                ...this.User,
                UserLastname: lastName
            };
        }

        if (email) {
            this.User = {
                ...this.User,
                UserEmail: email
            };
        }

        if (password) {
            this.User = {
                ...this.User,
                UserPassword: password
            };
        }

        if (phone) {
            this.User = {
                ...this.User,
                UserPhone: phone
            };
        }

        if (title) {
            this.User = {
                ...this.User,
                UserTitle: title
            };
        }

        if (valid) {
            this.User = {
                ...this.User,
                ValidID: valid
            };
        }
    }

}
