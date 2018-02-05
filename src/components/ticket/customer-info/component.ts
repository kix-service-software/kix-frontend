export class CustomerInfoComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            customer: null
        };
    }

    public onInput(input: any): void {
        this.state.customer = input.customer;
    }

    public onMount(): void {
        // TODO: mittels übergebener "customerId" den Kunden mit Hilfe eines service ermitteln
    }
}

module.exports = CustomerInfoComponent;
