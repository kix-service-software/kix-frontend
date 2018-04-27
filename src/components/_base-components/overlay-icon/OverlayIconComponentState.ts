import { OverlayWidgetData, ComponentContent, StringContent } from '@kix/core/dist/model';

export class OverlayIconComponentState {

    public constructor(
        public show: boolean = false,
        public overlayId: string = '',
        public overlayWidgetData: OverlayWidgetData = null,
        public isHintOverlay: boolean = false,
        public content: StringContent<any> | ComponentContent<any> = null
    ) { }

}
