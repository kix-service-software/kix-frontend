import { ComponentState } from "./ComponentState";
import { KIXObjectType, WidgetType, ContextMode, Customer, KIXObjectLoadingOptions } from "@kix/core/dist/model";
import { ContextService, ActionFactory, IdService, WidgetService } from "@kix/core/dist/browser";
import { CustomerDetailsContext } from "@kix/core/dist/browser/customer";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as CustomerDetailsContext);
        this.state.customerId = context.objectId.toString();

        if (!this.state.customerId) {
            this.state.error = 'No customer id given.';
        } else {
            this.state.configuration = context.configuration;
            this.state.loadingConfig = false;
            this.state.lanes = context.getLanes();
            this.state.tabWidgets = context.getLaneTabs();
            await this.loadCustomer();
            this.setActions();
        }
    }

    private async loadCustomer(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, ['Contacts', 'Tickets', 'TicketStats']
        );
        const customer = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, [this.state.customerId], loadingOptions, null, false
        ).catch((error) => {
            this.state.error = error;
        });

        if (customer && customer.length) {
            this.state.customer = customer[0];
            this.state.loadingCustomer = false;
        } else {
            this.state.error = `No customer found for id ${this.state.customerId}`;
        }
    }

    private setActions(): void {
        const config = this.state.configuration;
        if (config && this.state.customer) {
            const actions = ActionFactory.getInstance().generateActions(
                config.generalActions, true, [this.state.customer]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);
        }
    }

    public getCustomerActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.customerId) {
            actions = ActionFactory.getInstance().generateActions(config.customerActions, true, [this.state.customer]);
        }
        return actions;
    }

    public getTitle(): string {
        return this.state.customer
            ? this.state.customer.DisplayValue
            : 'Kunde: ' + this.state.customerId;

    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
