import { ContextService } from "../../../../core/browser/context";
import { ComponentState } from './ComponentState';
import { KIXObjectType, Contact, Context } from "../../../../core/model";
import { IdService } from "../../../../core/browser";

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.contextListernerId = IdService.generateDateBasedId('ticket-contact-info-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        const settings = this.state.widgetConfiguration.settings;
        if (settings && settings.groups) {
            this.state.groups = this.state.widgetConfiguration.settings.groups;
        }

        this.setContactId(context);

        context.registerListener(this.contextListernerId, {
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.state.contactId = contact ? contact.ContactID : null;
                }
            },
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });
    }

    private async setContactId(context: Context): Promise<void> {
        const contact = await context.getObject<Contact>(KIXObjectType.CONTACT);
        if (contact) {
            this.state.contactId = contact.ContactID;
        }
    }

}

module.exports = Component;
