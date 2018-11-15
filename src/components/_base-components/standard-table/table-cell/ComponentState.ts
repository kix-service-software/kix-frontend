import { ObjectIcon } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public loading: boolean = true,
        public icons: Array<string | ObjectIcon> = [],
        public displayValue: string = null
    ) { }

}
