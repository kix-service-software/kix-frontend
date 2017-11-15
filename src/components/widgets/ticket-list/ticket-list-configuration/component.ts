class TicketListConfigurationComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configuration: null
        };
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
    }

    public limitChanged(event: any): void {
        this.state.configuration.settings.limit = event.target.value;
    }

    public showTotalCountChanged(event: any): void {
        const currentShowTotalCount = this.state.configuration.settings.showTotalCount;
        this.state.configuration.settings.showTotalCount = !currentShowTotalCount;
    }

}

module.exports = TicketListConfigurationComponent;
