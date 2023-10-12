/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentContent } from '../../../../base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../../base-components/webapp/core/ConfirmOverlayContent';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ReportingContext } from '../context/ReportingContext';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { Row } from '../../../../table/model/Row';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Report } from '../../../model/Report';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';
import { ToastContent } from '../../../../base-components/webapp/core/ToastContent';

export class ReportDeleteAction extends AbstractAction {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Delete';
        this.icon = 'kix-icon-trash';
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
            if (
                this.data.getObjectType() === KIXObjectType.REPORT
            ) {
                const question = await TranslationService.translate(
                    'Translatable#Delete all selected reports?'
                );
                const content = new ComponentContent(
                    'confirm-overlay',
                    new ConfirmOverlayContent(question, this.deleteReport.bind(this))
                );

                OverlayService.getInstance().openOverlay(
                    OverlayType.CONFIRM, null, content, 'Translatable#Delete Report', null, false
                );
            }
        }
    }

    private async deleteReport(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext<ReportingContext>();
        if (context) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Deleting Reports' }
            );

            const selectedRows: Row[] = this.data.getSelectedRows();
            for (const r of selectedRows) {
                const report = (r.getRowObject().getObject() as Report);
                await KIXObjectService.deleteObject(KIXObjectType.REPORT, [report.ID])
                    .catch((error: Error) => {
                        console.error(error);
                        const content = new StringContent('Translatable#Error while deleting Report.');

                        OverlayService.getInstance().openOverlay(
                            OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                        );
                    });
            }

            setTimeout(() => {
                context.loadReportDefinitions();
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Translatable#Report(s) deleted.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }, 1000);

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
        }
    }
}
