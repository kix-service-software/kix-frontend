import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { ContextService, OverlayService } from "@kix/core/dist/browser";
import { ContextMode, ComponentContent, ToastContent, OverlayType } from "@kix/core/dist/model";

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

    // TODO: wieder entfernen, wenn nicht mehr gebraucht!
    public showTemporaryCommingSoon(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('Comming Soon', 'kix-icon-magicwand', 'Diese Funktionalität ist in Arbeit.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

}

module.exports = KIXHeaderComponent;
