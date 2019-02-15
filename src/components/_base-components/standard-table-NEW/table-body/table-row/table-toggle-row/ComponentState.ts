import { IRow } from "../../../../../../core/browser";

export class ComponentState {

    public constructor(
        public row: IRow = null,
        public width: string = '100%'
    ) { }

}
