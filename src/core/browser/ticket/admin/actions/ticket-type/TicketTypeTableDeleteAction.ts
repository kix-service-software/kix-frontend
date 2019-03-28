import {
    AbstractAction, ComponentContent, ConfirmOverlayContent,
    OverlayType, KIXObjectType, ToastContent
} from "../../../../../model";
import { OverlayService } from "../../../../OverlayService";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { ApplicationEvent } from "../../../../application";
import { ITable } from "../../../../table";

export class TicketTypeTableDeleteAction extends AbstractAction<ITable> {

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

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const selectedRows = this.data.getSelectedRows();
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(
                    `Die ausgewählten ${selectedRows.length} Einträge werden gelöscht. Sind Sie sicher?`,
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
        const selectedRows = this.data.getSelectedRows();
        if (selectedRows && !!selectedRows.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Entferne Typen ...'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TICKET_TYPE, selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId)
            );

            this.data.reload(true);

            if (!failIds || !!!failIds.length) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Typen wurden entfernt.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

}
