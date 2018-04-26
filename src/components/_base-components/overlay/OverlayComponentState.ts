import { ObjectIcon, IWidgetContent, OverlayType } from "@kix/core/dist/model";

export class OverlayComponentState {

    public constructor(
        public type: OverlayType = null,
        public content: IWidgetContent = null,
        public icon: string | ObjectIcon = null,
        public title: string = null,
        public actions: string[] = null,
        public hasCloseButton: boolean = false,
        public position: [number, number] = null,
        public keepShow: boolean = true,
        public show: boolean = false,
        public overlayClass: string = null,
        public instanceId: string = 'overlay-widget'
    ) { }

}
