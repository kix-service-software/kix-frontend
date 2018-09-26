import { ComponentState } from "./ComponentState";
import {
    ContextService, TableColumn, ITableConfigurationListener,
    ActionFactory, TableListenerConfiguration, StandardTableFactoryService, KIXObjectService
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact, ContextMode, KIXObjectLoadingOptions, Context } from "@kix/core/dist/model";
import { ContactService } from "@kix/core/dist/browser/contact";

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

    private async initWidget(customer: Customer): Promise<void> {
        this.state.customer = customer;
        this.setTable();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.customer]
            );
        }
    }

    private async setTable(): Promise<void> {
        if (this.state.customer && this.state.widgetConfiguration) {
            this.state.loading = true;
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            this.state.contactTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONTACT, this.state.widgetConfiguration.settings,
                null, listenerConfiguration, true
            );

            this.state.contactTable.setTableListener(() => {
                const count = this.state.contactTable.getTableRows(true).length;
                this.state.title = "Zugeordnete Ansprechpartner " + (count > 0 ? ' (' + count + ')' : '');
            });

            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, null, ['TicketStats']
            );
            const contactIds = this.state.customer.Contacts.map((c) => typeof c === 'string' ? c : c.ContactID);
            const contacts = await KIXObjectService.loadObjects(
                KIXObjectType.CONTACT, contactIds, loadingOptions, null, false
            );

            this.state.contactTable.layerConfiguration.contentLayer.setPreloadedObjects(contacts);
            this.state.contactTable.loadRows();

            this.state.loading = false;
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private tableRowClicked(contact: Contact, columnId: string): void {
        if (columnId === 'contact-new-ticket' && contact.ValidID === 1) {
            ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE);
        } else {
            ContactService.getInstance().openContact(contact.ContactID, false);
        }
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.contactTable.setFilterSettings(filterValue);
    }
}

module.exports = Component;
