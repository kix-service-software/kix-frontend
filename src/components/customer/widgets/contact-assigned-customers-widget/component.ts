import { ComponentState } from "./ComponentState";
import {
    ContextService, StandardTable, TableFilterLayer, TableSortLayer, IdService,
    TableColumn, ITableConfigurationListener, ITableClickListener, ActionFactory,
    TableLayerConfiguration, TableListenerConfiguration, StandardTableFactoryService
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact, ContextMode } from "@kix/core/dist/model";
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
            KIXObjectType.CONTACT, [context.objectId], ContextMode.DETAILS
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

    private setTable(): void {
        if (this.state.contact && this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            const layerCOnfiguration = new TableLayerConfiguration(
                new CustomerTableContentLayer(this.state.contact.UserCustomerIDs), new CustomerTableLabelLayer(),
                [new TableFilterLayer()], [new TableSortLayer()]
            );

            this.state.customerTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CUSTOMER, this.state.widgetConfiguration.settings,
                layerCOnfiguration, listenerConfiguration, true
            );
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
