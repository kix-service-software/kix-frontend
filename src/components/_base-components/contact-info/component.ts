export class ContactInfoComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            contact: null
        };
    }

    public onInput(input: any): void {
        this.state.contact = input.contact;
    }

    public onMount(): void {
        // TODO: mittels übergebener "contactId" den Konakt mit Hilfe eines service ermitteln
    }
}

module.exports = ContactInfoComponent;
