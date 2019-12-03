/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidObject, KIXObjectType } from "../../model";
import { LabelProvider } from "../LabelProvider";

export class ValidObjectLabelProvider extends LabelProvider<ValidObject> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public isLabelProviderFor(validObject: ValidObject): boolean {
        return validObject instanceof ValidObject;
    }

    public async getObjectText(validObject: ValidObject, id?: boolean, title?: boolean): Promise<string> {
        return validObject.Name;
    }

}
