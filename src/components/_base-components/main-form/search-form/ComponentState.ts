import { KIXObjectType, KIXObject, FormField } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public formId: string = null,
        public objectType: KIXObjectType = null,
        public resultCount: number = 0,
        public canSearch: boolean = true,
        public table: StandardTable<KIXObject> = null,
        public fulltextSearch: boolean = false,
        public defaultProperties: string[] = [],
        public fullTextField: FormField[] = [],
        public fulltextActive: boolean = false,
        public fulltextValue: string = null,
        public loading: boolean = true
    ) { }

}
