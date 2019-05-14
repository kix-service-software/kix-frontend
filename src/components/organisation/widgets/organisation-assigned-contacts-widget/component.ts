import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory, TableFactoryService } from "../../../../core/browser";
import { KIXObjectType, Organisation } from "../../../../core/model";
import { OrganisationDetailsContext } from "../../../../core/browser/organisation";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationDetailsContext>(
            OrganisationDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
        }

        context.registerListener('organisation-assigned-contacts-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, organisation: Organisation, type: KIXObjectType) => {
                if (type === KIXObjectType.ORGANISATION) {
                    this.initWidget(organisation);
                }
            }
        });

        await this.initWidget(await context.getObject<Organisation>());
    }

    private async initWidget(organisation: Organisation): Promise<void> {
        this.state.organisation = organisation;
        this.prepareTable();
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.organisation) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.organisation]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.organisation && this.state.widgetConfiguration) {

            const contactIds = this.state.organisation.Contacts.map((c) => typeof c === 'string' ? c : c.ID);
            this.state.table = await TableFactoryService.getInstance().createTable(
                'organisation-assigned-contacts', KIXObjectType.CONTACT,
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
