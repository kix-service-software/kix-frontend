/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../model/SystemAddress';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import addrparser from 'address-rfc2822';

export class SystemAddressService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: SystemAddressService = null;

    public static getInstance(): SystemAddressService {
        if (!SystemAddressService.INSTANCE) {
            SystemAddressService.INSTANCE = new SystemAddressService();
        }

        return SystemAddressService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.SYSTEM_ADDRESS);
        this.objectConstructors.set(KIXObjectType.SYSTEM_ADDRESS, [SystemAddress]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public getLinkObjectName(): string {
        return 'SystemAddress';
    }

    public async isSystemAddress(mail: string): Promise<boolean> {
        const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(KIXObjectType.SYSTEM_ADDRESS);
        if (systemAddresses) {
            try {
                const parseResult = addrparser.parse(mail);
                for (const address of parseResult) {
                    if (systemAddresses.some(
                        (sa) => sa.Name.toLowerCase() === address.address.toLowerCase())
                    ) return true;
                }
            } catch (e) {
                console.error(e);
            }
        }

        return false;
    }

}
