import { ComponentState } from "./ComponentState";
import {
    ContextService, TableColumn, ITableConfigurationListener, ActionFactory,
    TableListenerConfiguration, StandardTableFactoryService, KIXObjectService
} from "../../../../core/browser";
import { KIXObjectType, Customer, Contact, KIXObjectLoadingOptions } from "../../../../core/model";
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
        this.setTable();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private async setTable(): Promise<void> {
        if (this.state.contact && this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            this.state.customerTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CUSTOMER, this.state.widgetConfiguration.settings,
                null, listenerConfiguration, true
            );

            this.state.customerTable.setTableListener(() => {
                this.state.filterCount = this.state.customerTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('filterCount');
            });

            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, null, ['TicketStats']
            );
            const customer = await KIXObjectService.loadObjects(
                KIXObjectType.CUSTOMER, this.state.contact.UserCustomerIDs, loadingOptions, null, false
            );

            this.state.customerTable.layerConfiguration.contentLayer.setPreloadedObjects(customer);
            this.state.customerTable.loadRows();
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

    public tableRowClicked(customer: Customer, columnId: string): void {
        CustomerService.getInstance().openCustomer(customer.CustomerID, false);
    }

    public filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.customerTable.setFilterSettings(filterValue);
    }
}

module.exports = Component;
