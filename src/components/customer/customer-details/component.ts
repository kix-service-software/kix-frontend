import { ComponentState } from "./ComponentState";
import { ContextType, KIXObjectType, WidgetType } from "@kix/core/dist/model";
import { ContextService, ActionFactory, IdService } from "@kix/core/dist/browser";
import { CustomerDetailsContext, CustomerService } from "@kix/core/dist/browser/customer";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.customerId);
    }

    public async  onMount(): Promise<void> {

        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, customerDetailsCOntext: CustomerDetailsContext, type: ContextType) => {
                if (type === ContextType.MAIN && contextId === CustomerDetailsContext.CONTEXT_ID) {
                    this.state.configuration = customerDetailsCOntext.configuration;
                    this.state.loadingConfig = false;
                    this.state.lanes = customerDetailsCOntext.getLanes();
                    this.state.tabWidgets = customerDetailsCOntext.getLaneTabs();
                    (this as any).update();
                }
            }
        });

        const contextURL = 'tickets/' + this.state.customerId;
        const context = new CustomerDetailsContext(this.state.customerId);
        await ContextService.getInstance().provideContext(context, true, ContextType.MAIN);
        await this.loadCustomer();
    }

    private async loadCustomer(): Promise<void> {
        const customers = await CustomerService.getInstance().loadCustomers([this.state.customerId]);
        if (customers && customers.length) {
            this.state.customer = customers[0];
            const context = ContextService.getInstance().getContext(null, CustomerDetailsContext.CONTEXT_ID);
            context.provideObject(this.state.customer.CustomerID, this.state.customer, KIXObjectType.CUSTOMER);
        }
        this.state.loadingCustomer = false;
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
        const context = ContextService.getInstance().getContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
