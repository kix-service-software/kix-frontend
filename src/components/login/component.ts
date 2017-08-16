class LoginFormComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            userName: "",
            password: "",
            valid: false
        };
    }

    public onMount(): void {
        console.log("onMount() Login");
    }

    public login(): void {
        console.log('login ...');
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
