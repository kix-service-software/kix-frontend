class TicketHistoryWidgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            ticketId: null
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = input.ticketId;
    }

    public onMount(): void {
        // TODO: Load Configuration
    }

}

module.exports = TicketHistoryWidgetComponent;
