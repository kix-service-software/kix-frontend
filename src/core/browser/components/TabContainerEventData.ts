import { ObjectIcon } from "../../model";

export class TabContainerEventData {

    public constructor(
        public tabId: string,
        public title?: string,
        public icon?: string | ObjectIcon
    ) { }
}
