import {
    AuthenticationResult,
    AuthenticationEvent,
    LoginRequest,
    LoginComponentState,
    SocketEvent,
    UserType
} from './../../model-client/';

declare var io;

class LoginFormComponent {

    public state: LoginComponentState;

    public socket: any;

    public onCreate(input: any): void {
        this.state = new LoginComponentState(input.frontendSocketUrl);
    }

    public onMount(): void {
        this.socket = io.connect(this.state.frontendSocketUrl + "/authentication", {});

        this.socket.on(SocketEvent.CONNECT, () => {
            console.log("connected to socket server.");
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.state.error = 'Connection to socket server failed. ' + JSON.stringify(error);
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.state.error = 'Connection to socket server timeout.';
        });
    }

    public login(): void {
        this.socket.emit(AuthenticationEvent.LOGIN,
            new LoginRequest(this.state.userName, this.state.password, UserType.AGENT));

        this.socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
            window.localStorage.setItem('token', result.token);
            window.location.replace(result.redirectUrl);
        });

        this.socket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
            this.state.error = error;
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
