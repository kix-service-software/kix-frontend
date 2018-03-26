import { ObjectData, AbstractAction } from "@kix/core/dist/model";

export class BaseTemplateComponentState {

    public initialized: boolean = false;

    public constructor(
        public contextId: string,
        public objectData: ObjectData,
        public objectId: string,
        public configurationMode: boolean = false,
        public showShieldOverlay: boolean = false,
        public showInfoOverlay: boolean = false,
        public showMainDialog: boolean = false,
        public mainDialogTemplate: any = null,
        public mainDialogInput: any = null
    ) { }

}
