import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { DialogService } from "@kix/core/dist/browser/DialogService";

class KIXHeaderComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    private openDialog(): void {
        DialogService.getInstance().toggleMainDialog();
    }

    private logout(): void {
        ClientStorageService.destroyToken();
    }

}

module.exports = KIXHeaderComponent;
