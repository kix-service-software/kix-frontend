/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { InputFieldTypes } from "./InputFieldTypes";
import { ObjectDefinition } from "../../../../model/kix/ObjectDefinition";

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
