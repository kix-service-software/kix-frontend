import { ObjectIcon, IWidgetContent, OverlayType, AbstractAction, ComponentContent } from "@kix/core/dist/model";
import { IdService } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public type: OverlayType = null,
        public content: ComponentContent<any> = null,
        public icon: string | ObjectIcon = null,
        public title: string = null,
        public actions: AbstractAction[] = null,
        public hasCloseButton: boolean = false,
        public keepShow: boolean = true,
        public show: boolean = false,
        public overlayClass: string = null,
        public overlayInstanceId: string = 'overlay-widget',
        public overlayId: string = IdService.generateDateBasedId(),
    ) { }

}
