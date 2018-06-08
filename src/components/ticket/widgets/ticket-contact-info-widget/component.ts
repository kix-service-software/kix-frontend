import { TicketService } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Contact } from "@kix/core/dist/model";
import { ContactInfoWidgetComponentState } from './ContactInfoWidgetComponentState';

class ContactInfoWidgetComponent {

    private state: ContactInfoWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoWidgetComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = ContactInfoWidgetComponent;
