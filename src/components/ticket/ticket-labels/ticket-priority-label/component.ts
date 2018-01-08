export class TicketPriorityLabelComponent {

    private state: {};

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: input.ticketDataId,
            priorityId: input.value
        };
    }

    public onInput(input: any): void {
        this.state = {
            ticketDataId: input.ticketDataId,
            priorityId: input.value
        };
    }
}

module.exports = TicketPriorityLabelComponent;
