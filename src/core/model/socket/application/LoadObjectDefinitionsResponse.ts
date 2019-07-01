import { ISocketResponse } from "../ISocketResponse";
import { ObjectDefinition } from "../../kix/object-definition";

export class LoadObjectDefinitionsResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public objectDefinitions: ObjectDefinition[]
    ) { }

}
