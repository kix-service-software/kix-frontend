import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        ApplicationStore.getInstance().toggleDialog(require('./ticket-search-dialog'));
    }

    private openSearchDialog(): void {
        ApplicationStore.getInstance().toggleDialog(require('./ticket-search-dialog'));
    }

}

module.exports = TicketSearchComponent;
