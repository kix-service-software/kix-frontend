import { ContextService } from "@kix/core/dist/browser/context";
import { KIXObjectType, ContextMode, Ticket, Customer, KIXObject } from "@kix/core/dist/model";
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
        this.setCustomerId();

        context.registerListener({
            objectChanged: (customerId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.state.customerId = customer ? customer.CustomerID : null;
                }
            },
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; }
        });
    }

    private async setCustomerId(): Promise<void> {
        const contact = await ContextService.getInstance().getObject<Customer>(
            KIXObjectType.CONTACT, this.state.contextType
        );

        if (contact) {
            this.state.customerId = contact.CustomerID;
        }
    }

}

module.exports = CustomerInfoWidgetComponent;
