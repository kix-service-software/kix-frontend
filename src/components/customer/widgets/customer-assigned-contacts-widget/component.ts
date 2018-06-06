import { ComponentState } from "./ComponentState";
import {
    ContextService, StandardTable, TableFilterLayer,
    TableSortLayer, TableRowHeight, IdService, TableColumn,
    ITableConfigurationListener, ITableClickListener, DialogService, ActionFactory
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact } from "@kix/core/dist/model";
import {
    ContactTableContentLayer, ContactTableLabelLayer, ContactDetailsContext, ContactService
} from "@kix/core/dist/browser/contact";
import { ComponentRouterService } from "@kix/core/dist/browser/router";

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
                if (type === KIXObjectType.CUSTOMER && (!this.state.customer || !this.state.customer.equals(object))) {
                    this.state.customer = object;
                    this.setTable();
                }
            }
        });

        this.state.customer = (context.getObject(context.objectId) as Customer);
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setTable();
        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
            if (this.state.contactTable) {
                this.state.contactTable.setTableListener(() => {
                    const count = this.state.contactTable.getTableRows().length;
                    this.state.title += count > 0 ? ' (' + count + ')' : '';
                });
            }
        }
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, this.state.customer
            );
        }
    }

    private setTable(): void {
        if (this.state.customer && this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener<Contact> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            const clickListener: ITableClickListener<Contact> = {
                rowClicked: this.tableRowClicked.bind(this)
            };

            this.state.contactTable = new StandardTable(
                'assigned-contacts-' + IdService.generateDateBasedId(),
                new ContactTableContentLayer(this.state.customer.CustomerID),
                new ContactTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null, null, null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                null,
                clickListener,
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

    private tableRowClicked(contact: Contact, columnId: string): void {
        if (columnId === 'contact-new-ticket' && contact.ValidID === 1) {
            DialogService.getInstance().openMainDialog('new-ticket-dialog');
        } else {
            ContactService.getInstance().openContact(contact.ContactID, false);
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
