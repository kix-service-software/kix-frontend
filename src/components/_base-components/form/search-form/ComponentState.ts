import { KIXObjectType, KIXObject, FormField } from "../../../../core/model";
import { StandardTable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public objectType: KIXObjectType = null,
        public resultCount: number = 0,
        public canSearch: boolean = false,
        public table: StandardTable<KIXObject> = null
    ) { }

}
