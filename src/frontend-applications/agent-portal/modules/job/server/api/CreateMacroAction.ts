/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from "../../../../../../server/model/rest/RequestObject";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";

export class CreateMacroAction extends RequestObject {

    public constructor(
        type: string, parameters: {},
        validId: number, comment?: string
    ) {
        super();
        this.applyProperty("Type", type);
        this.applyProperty("Parameters", parameters);
        this.applyProperty(KIXObjectProperty.VALID_ID, validId);
        this.applyProperty(KIXObjectProperty.COMMENT, comment);
    }

}
