import { RequestObject } from "../RequestObject";
import { ConfigItemClassProperty } from "../../model";

export class CreateConfigItemClass extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.forEach((p) => {
            if (p[0] === ConfigItemClassProperty.DEFINITION_STRING) {
                let definitionString = p[1].toString();
                definitionString = definitionString
                    .replace(/\n/g, "\n")
                    .replace(/\u200B/g, "");
                p[1] = definitionString;
            }
            this.applyProperty(p[0], p[1]);
        });
    }

}
