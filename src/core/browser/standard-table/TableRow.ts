import { TableValue } from ".";
import { KIXObject } from "../../model";

export class TableRow<T extends KIXObject = KIXObject> {

    public constructor(
        public object: T,
        public values: TableValue[],
        public classes: string[],
        public isToggled: boolean = false,
        public selectable: boolean = true
    ) { }

}
