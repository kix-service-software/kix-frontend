import { ObjectIcon } from "../../../../../../../core/model";
import { ICell } from "../../../../../../../core/browser";

export class ComponentState {

    public constructor(
        public icons: Array<string | ObjectIcon> = null,
        public displayText: string = '',
        public loading: boolean = true,
        public cell: ICell = null
    ) { }

}
