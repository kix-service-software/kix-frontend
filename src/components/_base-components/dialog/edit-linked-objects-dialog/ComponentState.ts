import { StandardTable } from "../../../../core/browser";
import { KIXObjectPropertyFilter } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public linkObjectCount: number = 0,
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public canDelete: boolean = false,
        public canSubmit: boolean = false,
        public filterCount: number = null
    ) { }

}
