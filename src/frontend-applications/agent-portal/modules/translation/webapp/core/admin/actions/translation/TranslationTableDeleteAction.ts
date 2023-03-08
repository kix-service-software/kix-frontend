/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../../modules/base-components/webapp/core/AbstractAction';
import { TranslationService } from '../../../TranslationService';
import { ComponentContent } from '../../../../../../../modules/base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../../../../../modules/base-components/webapp/core/ConfirmOverlayContent';
import { OverlayService } from '../../../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../../../modules/base-components/webapp/core/OverlayType';
import { EventService } from '../../../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ToastContent } from '../../../../../../../modules/base-components/webapp/core/ToastContent';
import { Table } from '../../../../../../table/model/Table';

export class TranslationTableDeleteAction extends AbstractAction<Table> {

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

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const selectedRows = this.data.getSelectedRows();
            const question = await TranslationService.translate(
                'Translatable#The following {0} entries will be deleted. Are you sure?', [selectedRows.length]
            );
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(question, this.deleteTranslations.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM,
                null,
                content,
                'Translatable#Remove translations',
                null,
                false
            );
        }
    }

    public async deleteTranslations(): Promise<void> {
        const selectedRows = this.data.getSelectedRows();
        if (selectedRows && !!selectedRows.length) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Remove translations'
            });
            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.TRANSLATION_PATTERN, selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId)
            );

            this.data.reload(true);

            if (!failIds || failIds.length === 0) {
                const content = new ComponentContent(
                    'toast',
                    new ToastContent('kix-icon-check', 'Translatable#Translations successfully removed.')
                );
                OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

}
