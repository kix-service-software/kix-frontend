import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, TableFactoryService, TableEvent, DefaultColumnConfiguration
} from "../../../../core/browser";
import { KIXObjectType, Customer, ContactProperty, DataType } from "../../../../core/model";
import { CustomerDetailsContext } from "../../../../core/browser/customer";
import { IEventSubscriber, EventService } from "../../../../core/browser/event";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<CustomerDetailsContext>(
            CustomerDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
        }

        context.registerListener('customer-assigned-contacts-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.initWidget(customer);
                }
            }
        });

        await this.initWidget(await context.getObject<Customer>());
    }

    private async initWidget(customer: Customer): Promise<void> {
        this.state.customer = customer;
        this.prepareTable();
        this.prepareActions();
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.customer]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.customer && this.state.widgetConfiguration) {

            const contactIds = this.state.customer.Contacts.map((c) => typeof c === 'string' ? c : c.ContactID);
            this.state.table = await TableFactoryService.getInstance().createTable(
                'customer-assigned-contacts', KIXObjectType.CONTACT,
                this.state.widgetConfiguration.settings, contactIds, null, true
            );
        }
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }
}

module.exports = Component;
