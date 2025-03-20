/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../../modules/base-components/webapp/core/AbstractAction';
import { Table } from '../../../../../../table/model/Table';
import { TranslationService } from '../../../../../../../modules/translation/webapp/core/TranslationService';
import { ComponentContent } from '../../../../../../../modules/base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../../../../../modules/base-components/webapp/core/ConfirmOverlayContent';
import { OverlayService } from '../../../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../../../modules/base-components/webapp/core/OverlayType';
import { EventService } from '../../../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ToastContent } from '../../../../../../../modules/base-components/webapp/core/ToastContent';

export class QueueDeleteAction extends AbstractAction<Table> {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Delete';
        this.icon = 'kix-icon-trash';
    }

    public canRun(): boolean {
        return this.data?.getSelectedRows()?.length > 0;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            const selectedRows = this.data.getSelectedRows();
            const question = await TranslationService.translate(
                'Translatable#The following {0} entries will be deleted. Are you sure?', [selectedRows.length]
            );
            const content = new ComponentContent(
                'confirm-overlay', new ConfirmOverlayContent(question, this.deleteObjects.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Translatable#Remove Queues',
                null,
                false
            );
        }
    }

    public async deleteObjects(): Promise<void> {
        const selectedRows = this.data.getSelectedRows();
        if (selectedRows && !!selectedRows.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Remove Queues'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.QUEUE, selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId)
            );

            this.data.reload(true);

            if (!failIds || failIds.length === 0) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Translatable#Queues successfully removed.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

}
