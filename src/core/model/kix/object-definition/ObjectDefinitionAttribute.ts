import { DataType } from "../../DataType";
import { KIXObjectType } from "../KIXObjectType";

export class ObjectDefinitionAttribute {

    public constructor(
        public Name: string = null,
        public Datatype: DataType = null,
        public PossibleValues: any[],
        public ReferencedObject: KIXObjectType
    ) { }
}
