import {
    AbstractAction, ComponentContent, ConfirmOverlayContent,
    OverlayType, KIXObjectType, ToastContent
} from "../../../../../model";
import { OverlayService } from "../../../../OverlayService";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { ApplicationEvent } from "../../../../application";
import { ITable } from "../../../../table";
import { TranslationService } from "../../../../i18n/TranslationService";

export class TicketPriorityTableDeleteAction extends AbstractAction<ITable> {

    public async initAction(): Promise<void> {
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

    public async run(): Promise<void> {
        if (this.canRun()) {
            const selectedRows = this.data.getSelectedRows();
            const question = await TranslationService.translate(
                'Translatable#The following {1} entries will be deleted. Are you sure?', [selectedRows.length]
            );
            const content = new ComponentContent(
                'confirm-overlay', new ConfirmOverlayContent(question, this.deletePriorities.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Translatable#Remove Priorities',
                false
            );
        }
    }

    public async deletePriorities(): Promise<void> {
        const selectedRows = this.data.getSelectedRows();
        if (selectedRows && !!selectedRows.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Remove Priorities'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TICKET_PRIORITY, selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId)
            );

            this.data.reload(true);

            if (!failIds || !!!failIds.length) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Translatable#Priorities successfully removed.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

}
