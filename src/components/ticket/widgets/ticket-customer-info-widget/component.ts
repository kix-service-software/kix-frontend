import { ContextService } from "../../../../core/browser/context";
import { KIXObjectType, Customer, Context, WidgetConfiguration } from "../../../../core/model";
import { ComponentState } from './ComponentState';
import { IdService } from "../../../../core/browser";

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
        const settings = this.state.widgetConfiguration.settings;
        if (settings && settings.groups) {
            this.state.groups = this.state.widgetConfiguration.settings.groups;
        }
        this.setCustomerId(context);

        context.registerListener(this.contextListernerId, {
            objectChanged: (customerId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.state.customerId = customer ? customer.CustomerID : null;
                }
            },
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; }
        });
    }

    private async setCustomerId(context: Context): Promise<void> {
        const customer = await context.getObject<Customer>(KIXObjectType.CUSTOMER);

        if (customer) {
            this.state.customerId = customer.CustomerID;
        }
    }

}

module.exports = Component;
