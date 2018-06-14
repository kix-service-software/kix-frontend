import { ContextService } from "@kix/core/dist/browser/context";
import { ContactInfoWidgetComponentState } from './ContactInfoWidgetComponentState';
import { KIXObjectType, Contact } from "@kix/core/dist/model";

class ContactInfoWidgetComponent {

    private state: ContactInfoWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoWidgetComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setContactId();

        context.registerListener({
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

module.exports = ContactInfoWidgetComponent;
