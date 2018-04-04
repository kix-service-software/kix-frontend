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

}

module.exports = ContactInfoComponent;
