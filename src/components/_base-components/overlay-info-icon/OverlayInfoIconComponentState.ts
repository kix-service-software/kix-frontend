import { InfoOverlayWidgetData } from '@kix/core/dist/model';

export class OverlayInfoIconComponentState {

    public constructor(
        public show: boolean = false,
        public overlayId: string = '',
        public overlayWidgetData: InfoOverlayWidgetData = null
    ) { }

}
