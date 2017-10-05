class ConfigurationOverlayComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            widget: input.widget,
            configuration: null,
        };
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
    }

    public saveClicked(): void {
        (this as any).emit('saveConfigurationOverlay', this.state.configuration);
    }

    public cancelClicked(): void {
        (this as any).emit('cancelConfigurationOverlay');
    }

}

module.exports = ConfigurationOverlayComponent;
