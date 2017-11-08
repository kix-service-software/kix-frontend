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
        this.state.configuration.contentConfiguration.limit = event.target.value;
    }

    public showTotalCountChanged(event: any): void {
        const currentShowTotalCount = this.state.configuration.contentConfiguration.showTotalCount;
        this.state.configuration.contentConfiguration.showTotalCount = !currentShowTotalCount;
    }

}

module.exports = TicketListConfigurationComponent;
