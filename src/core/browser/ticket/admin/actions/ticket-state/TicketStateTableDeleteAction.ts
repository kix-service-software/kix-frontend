import {
    AbstractAction, KIXObject, ComponentContent, ConfirmOverlayContent,
    OverlayType, ToastContent, KIXObjectType
} from "../../../../../model";
import { OverlayService } from "../../../../OverlayService";
import { KIXObjectService } from "../../../../kix";
import { EventService } from "../../../../event";
import { ApplicationEvent } from "../../../../application";

export class TicketStateTableDeleteAction extends AbstractAction {

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

    // public run(): void {
    //     if (this.canRun()) {
    //         const content = new ComponentContent(
    //             'confirm-overlay',
    //             new ConfirmOverlayContent(
    //                 `Die ausgewählten ${this.selectedObjects.length} Einträge werden gelöscht. Sind Sie sicher?`,
    //                 this.deleteStates.bind(this)
    //             )
    //         );

    //         OverlayService.getInstance().openOverlay(
    //             OverlayType.CONFIRM,
    //             null,
    //             content,
    //             'Status entfernen',
    //             false
    //         );
    //     }
    // }

    public async deleteStates(): Promise<void> {
        if (this.selectedObjects && !!this.selectedObjects.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Entferne Status ...'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TICKET_STATE, this.selectedObjects.map((sO) => sO.ObjectId)
            );
            if (!failIds || !!!failIds.length) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Status wurden entfernt.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }
            EventService.getInstance().publish('TICKET_STATE_LIST_UPDATED', {
                loading: true, hint: 'Entferne Status ...'
            });
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }
}
