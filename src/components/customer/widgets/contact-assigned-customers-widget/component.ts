import { ComponentState } from "./ComponentState";
import {
    ContextService, TableFilterLayer, TableSortLayer,
    TableColumn, ITableConfigurationListener, ActionFactory,
    TableLayerConfiguration, TableListenerConfiguration, StandardTableFactoryService, KIXObjectServiceRegistry
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact } from "@kix/core/dist/model";
import {
    CustomerTableContentLayer, CustomerTableLabelLayer, CustomerService
} from "@kix/core/dist/browser/customer";

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

        const contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CONTACT, [context.objectId]
        );

        if (contacts && contacts.length) {
            this.state.contact = contacts[0];
            this.state.title += ' (' + this.state.contact.UserCustomerIDs.length + ')';
            this.setTable();
            this.setActions();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.contact]
            );
        }
    }

    private async setTable(): Promise<void> {
        if (this.state.contact && this.state.widgetConfiguration) {
            this.state.loading = true;
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            this.state.customerTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CUSTOMER, this.state.widgetConfiguration.settings,
                null, listenerConfiguration, true
            );

            const customer = await ContextService.getInstance().loadObjects(
                KIXObjectType.CUSTOMER, this.state.contact.UserCustomerIDs
            );

            this.state.customerTable.layerConfiguration.contentLayer.setPreloadedObjects(customer);
            this.state.customerTable.loadRows();
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

    private tableRowClicked(customer: Customer, columnId: string): void {
        CustomerService.getInstance().openCustomer(customer.CustomerID, false);
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.customerTable.setFilterSettings(filterValue);
    }
}

module.exports = Component;
