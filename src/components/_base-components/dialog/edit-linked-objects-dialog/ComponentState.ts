import { KIXObjectPropertyFilter } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public linkObjectCount: number = 0,
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public canDelete: boolean = false,
        public canSubmit: boolean = false,
        public filterCount: number = null
    ) { }

}
