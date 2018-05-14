import { DialogService } from "@kix/core/dist/browser/DialogService";

class NewTicketDialogComponent {

    private state: any;

    public onCreate(): void {
        this.state = {};
    }

    public onMount(): void {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
    }

    private submit(): void {
        alert('Ticket wird angelegt');
    }

}

module.exports = NewTicketDialogComponent;
