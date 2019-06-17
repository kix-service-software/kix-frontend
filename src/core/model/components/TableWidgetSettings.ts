import { KIXObjectType } from "../kix";
import { SortOrder } from "../sort";
import { TableConfiguration } from "../../browser";
import { TableFilterCriteria, KIXObjectPropertyFilter } from "./filter";

export class TableWidgetSettings {

    public constructor(
        public objectType: KIXObjectType,
        public sort?: [string, SortOrder],
        public tableConfiguration?: TableConfiguration,
        public headerComponents?: string[],
        public showFilter: boolean = true,
        public shortTable: boolean = false,
        public predefinedTableFilters: KIXObjectPropertyFilter[] = []
    ) { }

}
