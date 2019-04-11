import { IAction } from './IAction';
import { OverlayService } from '../../../browser';
import { ComponentContent } from '../widget';
import { ToastContent, OverlayType } from '../overlay';
import { TranslationService } from '../../../browser/i18n/TranslationService';

export abstract class AbstractAction<T = any> implements IAction<T> {

    public id: string;
    public text: string;
    public icon: string;
    public data: T;

    public abstract initAction(): Promise<void>;

    public async setData(data: T): Promise<void> {
        this.data = data;
    }

    public canRun(): boolean {
        return true;
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
