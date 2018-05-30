import { ComponentState } from "./ComponentState";
import {
    ContextService, StandardTable, TableFilterLayer,
    TableSortLayer, TableRowHeight, IdService, TableColumn, ITableConfigurationListener
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact } from "@kix/core/dist/model";
import { ContactService, ContactTableContentLayer, ContactTableLabelLayer } from "@kix/core/dist/browser/contact";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;

        const context = ContextService.getInstance().getContext();
        context.registerListener({
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectChanged: (objectId: string | number, object: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.state.customer = object;
                    this.setTable();
                }
            }
        });

        this.state.customer = (context.getObject(context.objectId) as Customer);
        this.setTable();
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setTable();
    }

    private setTable(): void {
        if (this.state.customer && this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener<Contact> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.contactTable = new StandardTable(
                'assigned-contacts-' + IdService.generateDateBasedId(),
                new ContactTableContentLayer(this.state.customer.CustomerID),
                new ContactTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null, null, null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                null, null,
                configurationListener,
                this.state.widgetConfiguration.settings.displayLimit,
                false,
                TableRowHeight.SMALL);
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

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        if (filterValue === '') {
            this.state.contactTable.resetFilter();
        } else {
            this.state.contactTable.setFilterSettings(filterValue);
        }
    }
}

module.exports = Component;
