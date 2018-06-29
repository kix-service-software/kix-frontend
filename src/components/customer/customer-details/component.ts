import { ComponentState } from "./ComponentState";
import { ContextType, KIXObjectType, WidgetType, ContextMode, Customer } from "@kix/core/dist/model";
import { ContextService, ActionFactory, IdService } from "@kix/core/dist/browser";
import { CustomerDetailsContext, CustomerService } from "@kix/core/dist/browser/customer";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.objectId);
    }

    public async  onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as CustomerDetailsContext);
        this.state.configuration = context.configuration;
        this.state.loadingConfig = false;
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        await this.loadCustomer();
    }

    private async loadCustomer(): Promise<void> {
        const contacts = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, [this.state.customerId], ContextMode.DETAILS);
        if (contacts && contacts.length) {
            this.state.customer = contacts[0];
            this.state.loadingCustomer = false;
        }
    }

    private getActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.customerId) {
            actions = ActionFactory.getInstance().generateActions(config.generalActions, true, this.state.customer);
        }
        return actions;
    }

    private getCustomerActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.customerId) {
            actions = ActionFactory.getInstance().generateActions(config.customerActions, true, this.state.customer);
        }
        return actions;
    }

    private getTitle(): string {
        return this.state.customer
            ? this.state.customer.DisplayValue
            : 'Kunde: ' + this.state.customerId;

    }

    private getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
