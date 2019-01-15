import { IAction } from './IAction';
import { OverlayService } from '../../../browser';
import { ComponentContent } from '../widget';
import { ToastContent, OverlayType } from '../overlay';

export abstract class AbstractAction<T = any> implements IAction<T> {

    public id: string;
    public text: string;
    public icon: string;
    public data: T;

    public abstract initAction(): void;
    public setData(data: T): void {
        this.data = data;
    }

    public canRun(): boolean {
        return true;
    }

    public run(event: any): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-magicwand', 'Diese Funktionalität ist in Arbeit.', 'Coming Soon')
        );
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

}
