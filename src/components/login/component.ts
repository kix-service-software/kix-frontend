import { AuthenticationResult, LoginRequest, UserType } from './../../model-client/';

declare var io;

class LoginFormComponent {

    public state: any;

    public socket: any;

    public onCreate(input: any): void {
        this.state = {
            userName: "",
            password: "",
            valid: false,
            error: null,
            frontendSocketUrl: input.frontendSocketUrl
        };
    }

    public onMount(): void {
        this.socket = io.connect(this.state.frontendSocketUrl + "/authentication", {
        });
    }

    public login(): void {
        this.socket.emit('login', new LoginRequest(this.state.userName, this.state.password, UserType.AGENT));

        this.socket.on('authorized', (result: AuthenticationResult) => {
            window.localStorage.setItem('token', result.token);
            window.location.replace(result.redirectUrl);
        });

        this.socket.on('unauthorized', (error) => {
            this.state.error = error;
            console.log(error);
        });
    }

    public userNameChanged(event: any): void {
        this.state.userName = event.target.value;
        this.validate();
    }

    public passwordChanged(event: any): void {
        this.state.password = event.target.value;
        this.validate();
    }

    private validate(): void {
        this.state.valid = this.state.userName !== "" && this.state.password !== "";
    }

}

module.exports = LoginFormComponent;
