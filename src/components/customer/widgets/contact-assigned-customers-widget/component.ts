import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory, TableFactoryService } from "../../../../core/browser";
import { KIXObjectType, Customer, Contact } from "../../../../core/model";
import { CustomerService } from "../../../../core/browser/customer";

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
        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
        }

        context.registerListener('contact-assigned-customer-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(contact);
                }
            }
        });

        this.initWidget(await context.getObject<Contact>());
    }

    private async initWidget(contact?: Contact): Promise<void> {
        this.state.contact = contact;
        this.state.title = this.state.widgetConfiguration.title
            + (this.state.contact.UserCustomerIDs && !!this.state.contact.UserCustomerIDs.length ?
                ` (${this.state.contact.UserCustomerIDs.length})` : '');
        this.prepareTable();
        this.prepareActions();
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.contact && this.state.widgetConfiguration) {

            this.state.table = TableFactoryService.getInstance().createTable(
                'contact-assigned-customer', KIXObjectType.CUSTOMER,
                this.state.widgetConfiguration.settings, this.state.contact.UserCustomerIDs,
                null, true
            );
        }
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }
}

module.exports = Component;
