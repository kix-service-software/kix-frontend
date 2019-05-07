import { RequestObject } from "../RequestObject";
import { ConfigItemClassProperty } from "../../model";

export class UpdateConfigItemClass extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super(parameter.filter((p) => p[0] !== ConfigItemClassProperty.DEFINITION_STRING));

        const definitionParameter = parameter.find((p) => p[0] === ConfigItemClassProperty.DEFINITION_STRING);
        if (definitionParameter) {
            let definitionString = definitionParameter[1].toString();
            definitionString = definitionString
                .replace(/\n/g, "\n")
                .replace(/\u200B/g, "");
            definitionParameter[1] = definitionString;

            this.applyProperty(definitionParameter[0], definitionParameter[1]);
        }
    }

}
