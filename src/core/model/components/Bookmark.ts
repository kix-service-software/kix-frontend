import { KIXObjectType, ObjectIcon } from "../kix";

export class Bookmark {

    public constructor(
        public title: string,
        public icon: string | ObjectIcon,
        public objectID: string | number,
        public objectType: KIXObjectType,
        public contextId: string
    ) { }

}
