class TicketCreationDialogComponent {

    public state: any;

    private store: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        this.store = require('./store');
    }

}

module.exports = TicketCreationDialogComponent;
