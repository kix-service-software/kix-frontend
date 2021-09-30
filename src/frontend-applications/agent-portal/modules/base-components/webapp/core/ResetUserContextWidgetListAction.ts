/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { User } from '../../../user/model/User';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { AbstractAction } from './AbstractAction';
import { ApplicationEvent } from './ApplicationEvent';
import { ComponentContent } from './ComponentContent';
import { ConfirmOverlayContent } from './ConfirmOverlayContent';
import { EventService } from './EventService';
import { KIXObjectService } from './KIXObjectService';
import { OverlayService } from './OverlayService';
import { OverlayType } from './OverlayType';
import { Table } from './table';

export class ResetUserContextWidgetListAction extends AbstractAction<Table | User>{

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Reset User Widgets';
        this.icon = 'fas fa-user-times';
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data instanceof Table) {
            const selectedRows = this.data.getSelectedRows();
            canRun = selectedRows && !!selectedRows.length;
        } else {
            canRun = this.data instanceof User;
        }
        return canRun;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            let question = await TranslationService.translate(
                'Translatable#The preference ContextWidgetLists will be reseted for the user. Are you sure?'
            );

            if (this.data instanceof Table) {
                const selectedRows = this.data.getSelectedRows();
                question = await TranslationService.translate(
                    'Translatable#The preference ContextWidgetLists will be reseted for the {0} selected user. Are you sure?',
                    [selectedRows.length]
                );

            }

            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(question, this.resetForTableSelection.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM, null, content, 'Translatable#Reset Preference', null, false
            );
        }
    }

    public async resetForTableSelection(): Promise<void> {
        if (this.data instanceof Table) {
            const selectedRows = this.data.getSelectedRows();
            if (Array.isArray(selectedRows) && !!selectedRows.length) {
                const userIds = selectedRows.map((sR) => sR.getRowObject().getObject().ObjectId);
                await this.resetUserPreference(userIds);
                this.data.reload(true);
            }
        } else if (this.data instanceof User) {
            this.resetUserPreference([this.data.UserID]);
        }
    }

    private async resetUserPreference(userIds: number[]): Promise<void> {
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: true, hint: 'Translatable#Reset Preference'
        });

        for (const userId of userIds) {
            await KIXObjectService.updateObject(
                KIXObjectType.USER, [[PersonalSettingsProperty.CONTEXT_WIDGET_LISTS, null]], userId
            );
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }


}