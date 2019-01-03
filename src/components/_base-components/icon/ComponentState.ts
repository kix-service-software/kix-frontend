import { ObjectIcon } from "../../../core/model";
import { IdService } from "../../../core/browser";

export class ComponentState {

    public constructor(
        public icon: string | ObjectIcon = null,
        public base64: boolean = false,
        public content: string = null,
        public contentType: string = null,
        public showUnknown: boolean = false,
        public iconId: string = IdService.generateDateBasedId()
    ) { }

}
