/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { Row } from '../../../../table/model/Row';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';
import { ToastContent } from '../../../../base-components/webapp/core/ToastContent';
import { Webform } from '../../../model/Webform';

export class WebformDeleteAction extends AbstractAction {

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

            const question = await TranslationService.translate(
                'Translatable#Delete all selected webforms?'
            );
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(question, this.deleteWebform.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM, null, content, 'Translatable#Delete Webform', null, false
            );

        }
    }

    private async deleteWebform(): Promise<void> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Deleting Webforms' }
        );

        const selectedRows: Row[] = this.data.getSelectedRows();
        for (const r of selectedRows) {
            const webform = (r.getRowObject().getObject() as Webform);

            await KIXObjectService.deleteObject(KIXObjectType.WEBFORM, [webform.ObjectId])
                .catch((error: Error) => {
                    console.error(error);
                    const content = new StringContent('Translatable#Error while deleting Webform.');

                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                    );
                });
        }

        this.data.reload(true);

        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Translatable#Webform(s) deleted.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
    }
}
