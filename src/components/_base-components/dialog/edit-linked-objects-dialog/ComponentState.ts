import { StandardTable } from "@kix/core/dist/browser";
import { KIXObjectPropertyFilter } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public dialogId: string = null,
        public loading: boolean = false,
        public linkObjectCount: number = 0,
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = []
    ) { }

}
