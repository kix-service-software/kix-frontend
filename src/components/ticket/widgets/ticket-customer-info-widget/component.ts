import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { Customer } from "@kix/core/dist/model";
import { CustomerWidgetComponentState } from './CustomerWidgetComponentState';

class CustomerInfoWidgetComponent {

    private state: CustomerWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerWidgetComponentState(input.instanceId);
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = CustomerInfoWidgetComponent;
