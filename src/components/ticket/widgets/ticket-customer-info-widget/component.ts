import { ContextService } from "@kix/core/dist/browser/context";
import { KIXObjectType, ContextMode, Ticket } from "@kix/core/dist/model";
import { CustomerWidgetComponentState } from './CustomerWidgetComponentState';

class CustomerInfoWidgetComponent {

    private state: CustomerWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerWidgetComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const ticketId = context.objectId;
        const tickets = await ContextService.getInstance().loadObjects<Ticket>(
            KIXObjectType.TICKET, [ticketId], ContextMode.DETAILS, null
        );

        if (tickets && tickets.length) {
            this.state.customerId = tickets[0].CustomerID;
        }
    }

}

module.exports = CustomerInfoWidgetComponent;
