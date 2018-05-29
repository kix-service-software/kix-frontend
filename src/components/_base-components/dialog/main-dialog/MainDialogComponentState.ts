import { ConfiguredWidget } from "@kix/core/dist/model";

export class MainDialogComponentState {

    public constructor(
        public show: boolean = false,
        public dialogWidgets: ConfiguredWidget[] = [],
        public dialogHint: string = "",
        public isLoading: boolean = false,
        public loadingHint: string = null,
        public contextId: string = null,
        public dialogId: string = null
    ) { }

}
