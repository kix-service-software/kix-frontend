import { ContextService } from "@kix/core/dist/browser/context";
import { ContactInfoWidgetComponentState } from './ContactInfoWidgetComponentState';
import { Ticket, ContextMode, KIXObjectType } from "@kix/core/dist/model";

class ContactInfoWidgetComponent {

    private state: ContactInfoWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoWidgetComponentState(input.instanceId);
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
            this.state.contactId = tickets[0].CustomerUserID;
        }
    }

}

module.exports = ContactInfoWidgetComponent;
