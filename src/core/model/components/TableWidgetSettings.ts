import { KIXObjectType } from "../kix";
import { SortOrder } from "../sort";
import { TableConfiguration } from "../../browser";

export class TableWidgetSettings {

    public constructor(
        public objectType: KIXObjectType,
        public sort?: [string, SortOrder],
        public tableConfiguration?: TableConfiguration,
        public headerComponents?: string[],
        public showFilter: boolean = true
    ) { }

}
