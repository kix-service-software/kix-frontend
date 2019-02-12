import { DataType } from "../../DataType";
import { SearchOperator } from "../../../browser";

export class ObjectDefinitionSearchAttribute {

    public constructor(
        public Name: string = null,
        public CorrespondingAttribute: string = null,
        public Datatype: DataType = null,
        public Sortable: number = 1,
        public Operators: SearchOperator[] = [],
        public Not: number = 1,
        public PossibleValues: any[]
    ) { }
}
