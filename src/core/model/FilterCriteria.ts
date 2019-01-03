import { SearchOperator } from "../browser";
import { FilterDataType } from "./FilterDataType";
import { FilterType } from "./FilterType";
import { KIXObject } from "./kix";

export class FilterCriteria {

    public constructor(
        public property: string,
        public operator: SearchOperator,
        public type: FilterDataType,
        public filterType: FilterType,
        public value: string | number | string[] | number[] | KIXObject
    ) { }

}
