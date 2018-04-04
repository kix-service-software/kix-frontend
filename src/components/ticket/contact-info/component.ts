import { ContactInfoComponentState } from './ContactInfoComponentState';

export class ContactInfoComponent {

    private state: ContactInfoComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.contact = input.contact;
    }
}

module.exports = ContactInfoComponent;
