/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, SystemAddress } from "../../model";

export class SystemAddressFormService extends KIXObjectFormService<SystemAddress> {

    private static INSTANCE: SystemAddressFormService = null;

    public static getInstance(): SystemAddressFormService {
        if (!SystemAddressFormService.INSTANCE) {
            SystemAddressFormService.INSTANCE = new SystemAddressFormService();
        }

        return SystemAddressFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }
}
