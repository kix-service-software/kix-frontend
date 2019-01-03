import {
    AbstractAction, KIXObject, ComponentContent, ConfirmOverlayContent,
    OverlayType, ToastContent, KIXObjectType
} from "../../../../../model";
import { OverlayService } from "../../../../OverlayService";
import { KIXObjectService } from "../../../../kix";
import { EventService } from "../../../../event";

export class TicketTypeTableDeleteAction extends AbstractAction {

    private selectedObjects: KIXObject[];

    public initAction(): void {
        this.text = "Löschen";
        this.icon = "kix-icon-trash";
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (
            this.data
            && this.data.tableConfiguration
            && this.data.tableConfiguration.enableSelection
            && this.data.listenerConfiguration.selectionListener
        ) {
            this.selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();
            canRun = this.selectedObjects && !!this.selectedObjects.length;
        }
        return canRun;
    }

    public run(): void {
        if (this.canRun()) {
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(
                    `Die ausgewählten ${this.selectedObjects.length} Einträge werden gelöscht. Sind Sie sicher?`,
                    this.deleteTypes.bind(this)
                )
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Typen entfernen',
                false
            );
        }
    }

    public async deleteTypes(): Promise<void> {
        if (this.selectedObjects && !!this.selectedObjects.length) {
            EventService.getInstance().publish('APP_LOADING', {
                loading: true, hint: 'Entferne Typen ...'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TICKET_TYPE, this.selectedObjects.map((sO) => sO.ObjectId)
            );
            if (!failIds || !!!failIds.length) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Typen wurden entfernt.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }
            EventService.getInstance().publish('TICKET_TYPE_LIST_UPDATED', {
                loading: true, hint: 'Entferne Typen ...'
            });
            EventService.getInstance().publish('APP_LOADING', { loading: false });
        }
    }
}
