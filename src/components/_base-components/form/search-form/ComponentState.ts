import { KIXObjectType, KIXObject } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public resultCount: number = 0,
        public canSearch: boolean = false,
        public table: ITable = null
    ) { }

}
