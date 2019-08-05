/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { SystemAddress, KIXObjectType } from "../../model";

export class SystemAddressService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: SystemAddressService = null;

    public static getInstance(): SystemAddressService {
        if (!SystemAddressService.INSTANCE) {
            SystemAddressService.INSTANCE = new SystemAddressService();
        }

        return SystemAddressService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public getLinkObjectName(): string {
        return 'SystemAddress';
    }

}
