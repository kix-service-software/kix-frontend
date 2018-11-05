import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory } from "@kix/core/dist/browser";
import { KIXObjectType, Customer } from "@kix/core/dist/model";
import { RoutingConfiguration } from '@kix/core/dist/browser/router';
import { CustomerDetailsContext } from "@kix/core/dist/browser/customer";

class Component {
    private state: ComponentState;

    private routingConfiguration: RoutingConfiguration;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext(CustomerDetailsContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('customer-info-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (contactId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.initWidget(customer);
                }
            }
        });

        await this.initWidget(await context.getObject<Customer>());
    }

    private async initWidget(customer?: Customer): Promise<void> {
        this.state.customer = null;
        setTimeout(() => {
            this.state.customer = customer;
            this.setActions();
        }, 100);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.customer]
            );
        }
    }

}

module.exports = Component;
