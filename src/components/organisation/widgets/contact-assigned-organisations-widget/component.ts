import { ComponentState } from './ComponentState';
import { ContextService, ActionFactory, TableFactoryService } from '../../../../core/browser';
import { KIXObjectType, Contact } from '../../../../core/model';

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

        context.registerListener('contact-assigned-organisations-component', {
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
            + (this.state.contact.OrganisationIDs && !!this.state.contact.OrganisationIDs.length ?
                ` (${this.state.contact.OrganisationIDs.length})` : '');
        this.prepareTable();
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.contact && this.state.widgetConfiguration) {

            this.state.table = await TableFactoryService.getInstance().createTable(
                'contact-assigned-organisation', KIXObjectType.ORGANISATION,
                this.state.widgetConfiguration.settings, this.state.contact.OrganisationIDs,
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
