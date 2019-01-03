import { ObjectIcon } from "../../core/model";

export class ComponentState {

    public constructor(
        public icon: string | ObjectIcon = null,
        public contexts: Array<[string, string]> = [],
        public loading: boolean = true
    ) { }

}
