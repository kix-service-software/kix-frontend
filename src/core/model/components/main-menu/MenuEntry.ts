import { ObjectIcon } from "../../kix";

export class MenuEntry {

    public constructor(
        public icon: string | ObjectIcon,
        public text: string,
        public mainContextId: string,
        public contextIds: string[],
        public active?: boolean
    ) { }

}
