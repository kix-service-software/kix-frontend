import { IRow } from "../../../../../core/browser/table";

export class ComponentState {

    public constructor(
        public row: IRow = null,
        public children: IRow[] = [],
        public open: boolean = false,
        public selected: boolean = false,
        public selectable: boolean = true,
    ) { }
}
