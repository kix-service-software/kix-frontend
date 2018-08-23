import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory } from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Context } from "@kix/core/dist/model";

class Component {
    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('contact-details-component', {
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
        this.state.customer = customer;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.customer]
            );
        }
    }

}

module.exports = Component;
