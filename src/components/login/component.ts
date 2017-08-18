declare var io;

class LoginFormComponent {

    public state: any;

    public socket: any;

    public onCreate(input: any): void {
        this.state = {
            userName: "",
            password: "",
            valid: false
        };
    }

    public onMount(): void {
        this.socket = io("http://localhost:3001/authentication");
    }

    public login(): void {
        console.log('login ...');
        this.socket.emit('login', { userName: this.state.userName, password: this.state.password });
        this.socket.on('LoginResult', (data) => {
            console.log(data);
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
