/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { ComponentContent } from '../../../base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../base-components/webapp/core/ConfirmOverlayContent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { OverlayService } from '../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../base-components/webapp/core/OverlayType';
import { ToastContent } from '../../../base-components/webapp/core/ToastContent';
import { Table } from '../../../table/model/Table';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { DynamicField } from '../../model/DynamicField';

export class DynamicFieldDeleteAction extends AbstractAction<Table> {

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
            canRun &&= !selectedRows.some((s) => s.getRowObject<DynamicField>().getObject().InternalField);
        }
        return canRun;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            const selectedRows = this.data.getSelectedRows();
            const question = await TranslationService.translate(
                'Translatable#The following {0} entries will be deleted. Are you sure?', [selectedRows.length]
            );
            const content = new ComponentContent(
                'confirm-overlay', new ConfirmOverlayContent(question, this.deleteDynamicFields.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Translatable#Remove Dynamic Fields',
                null,
                false
            );
        }
    }

    public async deleteDynamicFields(): Promise<void> {
        const selectedRows = this.data.getSelectedRows();
        if (selectedRows && !!selectedRows.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Remove Dynamic Fields'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.DYNAMIC_FIELD, selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId)
            );

            this.data.reload(true);

            if (!failIds || failIds.length === 0) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Translatable#Dynamic Fields successfully removed.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

}
