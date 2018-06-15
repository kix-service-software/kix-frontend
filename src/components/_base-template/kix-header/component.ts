import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import { ContextService } from "@kix/core/dist/browser";
import { ContextMode } from "@kix/core/dist/model";

class KIXHeaderComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    private openDialog(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE);
    }

    private logout(): void {
        ClientStorageService.destroyToken();
    }

}

module.exports = KIXHeaderComponent;
