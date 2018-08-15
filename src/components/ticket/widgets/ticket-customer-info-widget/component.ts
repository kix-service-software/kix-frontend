import { ContextService } from "@kix/core/dist/browser/context";
import { KIXObjectType, Customer } from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import { IdService } from "@kix/core/dist/browser";

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.contextListernerId = IdService.generateDateBasedId('ticket-customer-info-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setCustomerId();

        context.registerListener(this.contextListernerId, {
            objectChanged: (customerId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.state.customerId = customer ? customer.CustomerID : null;
                }
            },
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });
    }

    private async setCustomerId(): Promise<void> {
        const customer = await ContextService.getInstance().getObject<Customer>(
            KIXObjectType.CUSTOMER, this.state.contextType
        );

        if (customer) {
            this.state.customerId = customer.CustomerID;
        }
    }

}

module.exports = Component;
