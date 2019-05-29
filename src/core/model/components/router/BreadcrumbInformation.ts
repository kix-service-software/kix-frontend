import { ObjectIcon } from "../../kix";

export class BreadcrumbInformation {

    public constructor(
        public icon: string | ObjectIcon = null,
        public contextIds: string[] = [],
        public currentText: string
    ) { }

}
