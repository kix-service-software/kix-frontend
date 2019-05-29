import { ObjectIcon, OverlayType, AbstractAction, ComponentContent } from "../../../core/model";
import { IdService, AbstractComponentState } from "../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public type: OverlayType = null,
        public content: ComponentContent<any> = null,
        public icon: string | ObjectIcon = null,
        public title: string = null,
        public actions: AbstractAction[] = null,
        public hasCloseButton: boolean = false,
        public show: boolean = false,
        public overlayClass: string = null,
        public overlayInstanceId: string = 'overlay-widget',
        public overlayId: string = IdService.generateDateBasedId(),
    ) {
        super();
    }

}
