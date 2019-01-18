import { ObjectIcon } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = true,
        public icons: Array<string | ObjectIcon> = [],
        public displayValue: string = null
    ) { }

}
