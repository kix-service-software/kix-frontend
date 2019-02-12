import {
    AbstractAction, KIXObject, ComponentContent, ConfirmOverlayContent,
    OverlayType, KIXObjectType, ToastContent
} from "../../../../../model";
import { OverlayService } from "../../../../OverlayService";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";

export class TicketPriorityTableDeleteAction extends AbstractAction {

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
                    this.deletePriorities.bind(this)
                )
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Prioritäten entfernen',
                false
            );
        }
    }

    public async deletePriorities(): Promise<void> {
        if (this.selectedObjects && !!this.selectedObjects.length) {
            EventService.getInstance().publish('APP_LOADING', {
                loading: true, hint: 'Entferne Prioritäten ...'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TICKET_PRIORITY, this.selectedObjects.map((sO) => sO.ObjectId)
            );
            if (!failIds || !!!failIds.length) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Prioritäten wurden entfernt.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }
            EventService.getInstance().publish('TICKET_PRIORITY_LIST_UPDATED', {
                loading: true, hint: 'Entferne Prioritäten ...'
            });
            EventService.getInstance().publish('APP_LOADING', { loading: false });
        }
    }

}
