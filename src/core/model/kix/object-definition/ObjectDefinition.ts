import { ObjectDefinitionSearchAttribute } from "./ObjectDefinitionSearchAttribute";
import { ObjectDefinitionAttribute } from "./ObjectDefinitionAttribute";

export class ObjectDefinition {

    public constructor(
        public Object: string = null,
        public Attributes: ObjectDefinitionAttribute[] = [],
        public SearchAttributes: ObjectDefinitionSearchAttribute[] = []
    ) { }
}
