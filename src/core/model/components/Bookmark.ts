import { KIXObjectType, ObjectIcon } from "../kix";
import { UIComponentPermission } from "../UIComponentPermission";

export class Bookmark {

    public constructor(
        public title: string,
        public icon: string | ObjectIcon,
        public objectID: string | number,
        public objectType: KIXObjectType,
        public contextId: string,
        public permissions: UIComponentPermission[] = []
    ) { }

}
