import {
    AbstractAction, ComponentContent, ConfirmOverlayContent,
    OverlayType, KIXObjectType, ToastContent
} from "../../../../../model";
import { OverlayService } from "../../../../OverlayService";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { ApplicationEvent } from "../../../../application";
import { ITable } from "../../../../table";

export class TicketStateTableDeleteAction extends AbstractAction<ITable> {

    public initAction(): void {
        this.text = 'Translatable#Delete';
        this.icon = "kix-icon-trash";
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            const selectedRows = this.data.getSelectedRows();
            canRun = selectedRows && !!selectedRows.length;
        }
        return canRun;
    }

    public run(): void {
        if (this.canRun()) {
            const selectedRows = this.data.getSelectedRows();
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(
                    `Die ausgewählten ${selectedRows.length} Einträge werden gelöscht. Sind Sie sicher?`,
                    this.deleteStates.bind(this)
                )
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Status entfernen',
                false
            );
        }
    }

    public async deleteStates(): Promise<void> {
        const selectedRows = this.data.getSelectedRows();
        if (selectedRows && !!selectedRows.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Entferne Status ...'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TICKET_STATE, selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId)
            );

            this.data.reload(true);

            if (!failIds || !!!failIds.length) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Status wurden entfernt.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

}
