class WidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configurationMode: false,
            showConfiguration: false,
            configuration: null,
            widget: input.widget
        };
    }

    public onInput(input: any): void {
        this.state.configurationMode = input.configurationMode;
    }

    public configClicked(): void {
        this.state.showConfiguration = true;
    }

    public widgetConfigurationLoaded(configuration: any) {
        this.state.configuration = configuration;
    }

    public saveConfigurationOverlay(configuration): void {
        this.state.showConfiguration = false;
    }

    public closeConfigurationOverlay(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = WidgetComponent;
