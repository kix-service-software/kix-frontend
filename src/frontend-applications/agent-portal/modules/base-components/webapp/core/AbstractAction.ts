/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAction } from './IAction';
import { ComponentContent } from './ComponentContent';
import { ToastContent } from './ToastContent';
import { OverlayService } from './OverlayService';
import { OverlayType } from './OverlayType';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export abstract class AbstractAction<T = any> implements IAction<T> {

    public id: string;
    public text: string;
    public icon: string | ObjectIcon;
    public data: T;
    public hasLink: boolean = true;

    public permissions: UIComponentPermission[] = [];

    public abstract initAction(): Promise<void>;

    public async setData(data: T): Promise<void> {
        this.data = data;
    }

    public canRun(): boolean {
        return true;
    }

    public async canShow(): Promise<boolean> {
        return true;
    }

    public async getLinkData(): Promise<string> {
        return '';
    }

    public async run(event: any): Promise<void> {
        const text = await TranslationService.translate('Translatable#We are working on this functionality.');
        // TODO: Use event to open overlay
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-magicwand', text, 'Coming Soon')
        );
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

}
