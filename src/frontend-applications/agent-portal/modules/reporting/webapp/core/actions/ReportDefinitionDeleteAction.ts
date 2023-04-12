/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ToastContent } from '../../../../base-components/webapp/core/ToastContent';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';

export class ReportDefinitionDeleteAction extends AbstractAction {

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
                this.data.getObjectType() === KIXObjectType.REPORT_DEFINITION
            ) {
                const question = await TranslationService.translate(
                    'Translatable#Delete all selected report definitions?'
                );
                const content = new ComponentContent(
                    'confirm-overlay',
                    new ConfirmOverlayContent(question, this.deleteReportDefinition.bind(this))
                );

                OverlayService.getInstance().openOverlay(
                    OverlayType.CONFIRM, null, content, 'Translatable#Delete Report Definition', null, false
                );
            }
        }
    }

    private async deleteReportDefinition(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as ReportingContext;
        if (context) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Deleting Report Definitions' }
            );

            const selectedRows: Row[] = this.data.getSelectedRows();
            for (const r of selectedRows) {
                const definition = (r.getRowObject().getObject() as ReportDefinition);
                await KIXObjectService.deleteObject(KIXObjectType.REPORT_DEFINITION, [definition.ID])
                    .catch((error: Error) => {
                        const content = new StringContent(
                            'Translatable#Error while deleting Report Definition.'
                        );

                        OverlayService.getInstance().openOverlay(
                            OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                        );
                    });
            }

            // reload the table
            context.reloadObjectList(KIXObjectType.REPORT_DEFINITION);

            setTimeout(() => {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Translatable#Report Definition(s) deleted.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }, 1000);

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
        }
    }

}
