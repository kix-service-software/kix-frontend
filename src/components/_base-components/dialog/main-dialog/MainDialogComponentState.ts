import { ConfiguredWidget } from "@kix/core/dist/model";

export class MainDialogComponentState {

    public constructor(
        public show: boolean = false,
        public dialogWidgets: ConfiguredWidget[] = [],
        public dialogHint: string = ""
    ) { }

}
