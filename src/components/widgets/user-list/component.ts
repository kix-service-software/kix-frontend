class UserListWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            columns: [
                "alle",
                "Firstname",
                "Lastname",
                "Email"
            ],
            values: []
        };
    }

    public onMount(): void {
        console.log("Mount User List Widget");
    }
}

module.exports = UserListWidgetComponent;
