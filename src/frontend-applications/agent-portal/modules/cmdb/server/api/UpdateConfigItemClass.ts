/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../../../../../../server/model/rest/RequestObject';
import { ConfigItemClassProperty } from '../../model/ConfigItemClassProperty';

export class UpdateConfigItemClass extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super(parameter.filter((p) => p[0] !== ConfigItemClassProperty.DEFINITION_STRING));

        const definitionParameter = parameter.find((p) => p[0] === ConfigItemClassProperty.DEFINITION_STRING);
        if (definitionParameter) {
            let definitionString = definitionParameter[1].toString();
            definitionString = definitionString
                .replace(/\n/g, '\n')
                .replace(/\u200B/g, '');
            definitionParameter[1] = definitionString;

            this.applyProperty(definitionParameter[0], definitionParameter[1]);
        }
    }

}
