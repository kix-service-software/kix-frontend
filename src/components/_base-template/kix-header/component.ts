import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { ContextService, OverlayService } from "@kix/core/dist/browser";
import { ContextMode, ComponentContent, ToastContent, OverlayType } from "@kix/core/dist/model";

class KIXHeaderComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            // TODO: durch registrierte Werte ersetzen
            toolbarGroups: [
                [
                    {
                        icon: 'kix-icon-man',
                        title: 'Meine Tickets mit neuen Artikeln',
                        withNew: true,
                        number: 3
                    },
                    {
                        icon: 'kix-icon-man',
                        title: 'Meine Tickets',
                        withNew: false,
                        number: 15
                    }
                ],
                [
                    {
                        icon: 'kix-icon-eye',
                        title: 'Meine beobachteten Tickets mit neuen Artikeln',
                        withNew: true,
                        number: 4
                    },
                    {
                        icon: 'kix-icon-eye',
                        title: 'Meine beobachteten Tickets',
                        withNew: false,
                        number: 8
                    }
                ],
                [
                    {
                        icon: 'kix-icon-lock-close',
                        title: 'Meine gesperrten Tickets mit neuen Artikeln',
                        withNew: true,
                        number: 2
                    },
                    {
                        icon: 'kix-icon-lock-close',
                        title: 'Meine gesperrten Tickets',
                        withNew: false,
                        number: 37
                    },
                ]
            ]
        };
    }

    public openDialog(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE);
    }

    public logout(): void {
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
