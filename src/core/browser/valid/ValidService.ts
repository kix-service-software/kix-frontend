/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { KIXObjectType } from "../../model";

export class ValidService extends KIXObjectService {

    private static INSTANCE: ValidService;

    public static getInstance(): ValidService {
        if (!ValidService.INSTANCE) {
            ValidService.INSTANCE = new ValidService();
        }
        return ValidService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public getLinkObjectName(): string {
        return 'Valid';
    }


}
