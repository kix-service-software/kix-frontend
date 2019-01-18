import { InputFieldTypes } from "../../model";
import { ObjectDefinition } from "../../model/kix/object-definition";

export class ObjectDefinitionUtil {

    public static getAttributeFieldType(objectDefinition: ObjectDefinition, property: string): InputFieldTypes {
        if (objectDefinition) {
            const attribute = objectDefinition.Attributes.find((a) => a.Name === property);
            if (attribute) {
                switch (attribute.Datatype.toLocaleLowerCase()) {
                    case 'date':
                        return InputFieldTypes.DATE;
                    case 'datetime':
                        return InputFieldTypes.DATE_TIME;
                    case 'text':
                        return InputFieldTypes.TEXT;
                    case 'textarea':
                        return InputFieldTypes.TEXT_AREA;
                    case 'generalcatalog':
                        return InputFieldTypes.DROPDOWN;
                    case 'ciclassreference':
                        return InputFieldTypes.CI_REFERENCE;
                    default:
                }
            }
        }

        return InputFieldTypes.TEXT;
    }

}
