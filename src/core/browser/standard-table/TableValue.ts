import { ObjectIcon } from "../../model";

export class TableValue {

    public constructor(
        public columnId: string,
        public objectValue: number | string,
        public displayValue: string,
        public classes: string[],
        public icons: Array<string | ObjectIcon>
    ) { }

}
