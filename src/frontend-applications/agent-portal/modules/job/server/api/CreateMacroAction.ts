/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../../../../../../server/model/rest/RequestObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { MacroActionProperty } from '../../model/MacroActionProperty';

export class CreateMacroAction extends RequestObject {

    public constructor(
        type: string, parameters: any, resultVariables: any,
        validId: number, comment?: string
    ) {
        super();
        this.applyProperty(MacroActionProperty.TYPE, type);
        this.applyProperty(MacroActionProperty.PARAMETERS, parameters);
        this.applyProperty(MacroActionProperty.RESULT_VARIABLES, resultVariables);
        this.applyProperty(KIXObjectProperty.VALID_ID, validId);
        this.applyProperty(KIXObjectProperty.COMMENT, comment);
    }

}
