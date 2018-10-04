import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { ContextService, OverlayService } from "@kix/core/dist/browser";
import { ContextMode, ComponentContent, ToastContent, OverlayType } from "@kix/core/dist/model";

class KIXHeaderComponent {

    public openDialog(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE);
    }

    public showTemporaryComingSoon(): void {
        const content = new ComponentContent('toast', new ToastContent(
            'Coming Soon', 'kix-icon-magicwand', 'Diese Funktionalität ist in Arbeit.'
        ));
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

    public logout(): void {
        ClientStorageService.destroyToken();
    }

}

module.exports = KIXHeaderComponent;
