import { TableFilterCriteria } from "./TableFilterCriteria";
import { ObjectIcon } from "../../kix";

export class KIXObjectPropertyFilter {

    public constructor(
        public name: string,
        public criteria: TableFilterCriteria[],
        public icon?: string | ObjectIcon
    ) { }

}
