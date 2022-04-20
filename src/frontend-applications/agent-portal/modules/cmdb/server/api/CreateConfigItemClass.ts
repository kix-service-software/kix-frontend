/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../../../../../../server/model/rest/RequestObject';
import { ConfigItemClassProperty } from '../../model/ConfigItemClassProperty';

export class CreateConfigItemClass extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.forEach((p) => {
            if (p[0] === ConfigItemClassProperty.DEFINITION_STRING) {
                let definitionString = p[1].toString();
                definitionString = definitionString
                    .replace(/\n/g, '\n')
                    .replace(/\u200B/g, '');
                p[1] = definitionString;
            }
            this.applyProperty(p[0], p[1]);
        });
    }

}
