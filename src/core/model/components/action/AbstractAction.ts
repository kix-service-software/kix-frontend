/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAction } from './IAction';
import { OverlayService } from '../../../browser';
import { ComponentContent } from '../widget';
import { ToastContent, OverlayType } from '../overlay';
import { TranslationService } from '../../../browser/i18n/TranslationService';
import { UIComponentPermission } from '../../UIComponentPermission';

export abstract class AbstractAction<T = any> implements IAction<T> {

    public id: string;
    public text: string;
    public icon: string;
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
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-magicwand', text, 'Coming Soon')
        );
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

}
