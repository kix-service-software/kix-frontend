class UserListConfigurationComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configuration: null
        };
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
    }

    public limitChanged(event): void {
        this.state.configuration.limit = event.target.value;
    }

}

module.exports = UserListConfigurationComponent;
