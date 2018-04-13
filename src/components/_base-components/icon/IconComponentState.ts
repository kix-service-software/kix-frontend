import { ObjectIcon } from "@kix/core/dist/model";

export class IconComponentState {

    public constructor(
        public icon: string | ObjectIcon = null,
        public base64: boolean = false,
        public content: string = null,
        public showUnknown: boolean = false
    ) { }

}
