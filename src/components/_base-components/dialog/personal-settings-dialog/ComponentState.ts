import { StandardTable } from "../../../../core/browser";
import { KIXObjectPropertyFilter } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public canSubmit: boolean = false
    ) { }

}
