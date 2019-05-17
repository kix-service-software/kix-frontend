import { IRow } from "../../../../../../core/browser";
import { IAction } from "../../../../../../core/model";

export class ComponentState {

    public constructor(
        public row: IRow = null,
        public width: string = '100%',
        public actions: IAction[] = null
    ) { }

}
