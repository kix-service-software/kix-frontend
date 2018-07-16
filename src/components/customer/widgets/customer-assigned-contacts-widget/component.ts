import { ComponentState } from "./ComponentState";
import {
    ContextService, StandardTable, TableFilterLayer,
    TableSortLayer, IdService, TableColumn, ITableConfigurationListener, ITableClickListener,
    ActionFactory, TableLayerConfiguration, TableListenerConfiguration, StandardTableFactoryService
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact, ContextMode } from "@kix/core/dist/model";
import {
    ContactTableContentLayer, ContactTableLabelLayer, ContactService
} from "@kix/core/dist/browser/contact";

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

        const customers = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, [context.objectId]
        );

        if (customers && customers.length) {
            this.state.customer = customers[0];
            this.setTable();
            this.setActions();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.customer]
            );
        }
    }

    private setTable(): void {
        if (this.state.customer && this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            const layerConfiguration = new TableLayerConfiguration(
                new ContactTableContentLayer(this.state.customer.CustomerID),
                new ContactTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()]
            );

            this.state.contactTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONTACT, this.state.widgetConfiguration.settings,
                layerConfiguration, listenerConfiguration, true
            );

            this.state.contactTable.setTableListener(() => {
                const count = this.state.contactTable.getTableRows(true).length;
                this.state.title = "Zugeordnete Ansprechpartner " + (count > 0 ? ' (' + count + ')' : '');
            });
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
