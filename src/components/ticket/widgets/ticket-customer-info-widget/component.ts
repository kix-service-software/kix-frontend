import { TicketService } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Customer } from "@kix/core/dist/model";
import { CustomerWidgetComponentState } from './CustomerWidgetComponentState';

class CustomerInfoWidgetComponent {

    private state: CustomerWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerWidgetComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = CustomerInfoWidgetComponent;
