import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { ContextService, OverlayService } from "@kix/core/dist/browser";
import { ContextMode, ComponentContent, ToastContent, OverlayType } from "@kix/core/dist/model";

class KIXHeaderComponent {

    public openDialog(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE);
    }

    public logout(): void {
        ClientStorageService.destroyToken();
    }

}

module.exports = KIXHeaderComponent;
