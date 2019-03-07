import { ICell } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public cell: ICell = null,
        public isActive: boolean = false
    ) { }

}
