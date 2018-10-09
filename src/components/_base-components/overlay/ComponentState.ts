import { ObjectIcon, IWidgetContent, OverlayType, AbstractAction } from "@kix/core/dist/model";
import { IdService } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public type: OverlayType = null,
        public content: IWidgetContent<any> = null,
        public icon: string | ObjectIcon = null,
        public title: string = null,
        public actions: AbstractAction[] = null,
        public hasCloseButton: boolean = false,
        public position: [number, number] = null,
        public keepShow: boolean = true,
        public show: boolean = false,
        public overlayClass: string = null,
        public instanceId: string = 'overlay-widget',
        public overlayId: string = IdService.generateDateBasedId()
    ) { }

}
