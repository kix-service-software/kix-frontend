import { ObjectIcon } from "../../kix";

export class ToastContent {
    public constructor(public icon: string | ObjectIcon, public text: string = '', public title?: string) { }
}
