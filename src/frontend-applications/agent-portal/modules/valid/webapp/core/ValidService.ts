/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";

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

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public getLinkObjectName(): string {
        return 'Valid';
    }


}
