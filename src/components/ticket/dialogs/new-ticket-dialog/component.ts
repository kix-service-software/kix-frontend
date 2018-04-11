import { DialogService } from "@kix/core/dist/browser/DialogService";

class NewTicketDialogComponent {

    private state: any;

    public onCreate(): void {
        this.state = {};
    }

    public onMount(): void {
        DialogService.getInstance().setDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
    }

}

module.exports = NewTicketDialogComponent;
