import { ObjectIcon, KIXObject } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState {
    public constructor(
        public criterias: Array<[string, string, string]> = [],
        public fromHistory: boolean = false,
        public resultTitle: string = "Trefferliste:",
        public resultIcon: string | ObjectIcon = null,
        public resultTable: StandardTable<KIXObject> = null,
        public noSearch: boolean = true
    ) { }
}
