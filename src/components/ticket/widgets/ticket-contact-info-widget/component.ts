import { ContextService } from "@kix/core/dist/browser/context";
import { ComponentState } from './ComponentState';
import { KIXObjectType, Contact } from "@kix/core/dist/model";
import { IdService } from "@kix/core/dist/browser";

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
        this.setContactId();

        context.registerListener(this.contextListernerId, {
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.state.contactId = contact ? contact.ContactID : null;
                }
            },
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; }
        });
    }

    private async setContactId(): Promise<void> {
        const contact = await ContextService.getInstance().getObject<Contact>(
            KIXObjectType.CONTACT, this.state.contextType
        );

        if (contact) {
            this.state.contactId = contact.ContactID;
        }
    }

}

module.exports = Component;
