export class BaseTemplateComponentState {

    public constructor(
        public contextId: string,
        public objectId: string,
        public tagLib: any,
        public configurationMode: boolean = false,
        public showShieldOverlay: boolean = false,
        public showInfoOverlay: boolean = false,
        public showMainDialog: boolean = false,
        public mainDialogTemplate: any = null,
        public mainDialogInput: any = null,
        public infoOverlayIcon: any = null,
        public infoOverlayTitle: string = "",
        public infoOverlayContent: any = null,
        public infoOverlayPosition: [number, number] = null
    ) { }

}
