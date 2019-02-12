import { Contact, KIXObjectType } from "../../../core/model";
import { ComponentState } from "./ComponentState";
import { KIXObjectService } from "../../../core/browser";

class ContactInfoComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contactId = input.contactId;
        this.state.groups = input.groups;
        this.loadContact();
    }

    public onMount(): void {
        this.loadContact();
    }

    private async loadContact(): Promise<void> {
        this.state.error = null;
        this.state.contact = null;

        if (this.state.contactId) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [this.state.contactId]
            ).catch((error) => {
                this.state.error = error;
            });

            if (contacts && contacts.length) {
                this.state.contact = contacts[0];
                this.state.info = this.state.contact.getContactInfoData();
                if (this.state.groups && this.state.groups.length) {
                    this.state.info = this.state.info.filter(
                        (g) => this.state.groups.some((group) => group === g[0])
                    );
                }
            }
        }
    }

}

module.exports = ContactInfoComponent;
