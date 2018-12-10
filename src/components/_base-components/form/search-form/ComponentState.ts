import { KIXObjectType, KIXObject, FormField } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public objectType: KIXObjectType = null,
        public resultCount: number = 0,
        public canSearch: boolean = false,
        public table: StandardTable<KIXObject> = null
    ) { }

}
