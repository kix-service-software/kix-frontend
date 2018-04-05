import { ContactInfoComponentState } from './ContactInfoComponentState';

export class ContactInfoComponent {

    private state: ContactInfoComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoComponentState();
    }

    public onInput(input: any): void {
        if (this.contactChanged(input)) {
            this.state.contact = input.contact;
        }
    }

    private contactChanged(input: any): boolean {
        let changed = true;

        if (this.state.contact) {
            changed = input.contact && (this.state.contact.ContactID !== input.contact.ContactID);
        }

        return changed;
    }

}

module.exports = ContactInfoComponent;
