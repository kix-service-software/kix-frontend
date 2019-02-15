import { SearchOperator } from "../../../browser";

export class TableFilterCriteria {

    public constructor(
        public property: string,
        public operator: SearchOperator,
        public value: string | number | string[] | number[],
        public useObjectService: boolean = false
    ) { }

}
