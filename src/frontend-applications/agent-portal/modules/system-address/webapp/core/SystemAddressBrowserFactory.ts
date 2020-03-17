/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from "../../../../modules/base-components/webapp/core/KIXObjectFactory";
import { SystemAddress } from "../../model/SystemAddress";


export class SystemAddressBrowserFactory extends KIXObjectFactory<SystemAddress> {

    private static INSTANCE: SystemAddressBrowserFactory;

    public static getInstance(): SystemAddressBrowserFactory {
        if (!SystemAddressBrowserFactory.INSTANCE) {
            SystemAddressBrowserFactory.INSTANCE = new SystemAddressBrowserFactory();
        }
        return SystemAddressBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(systemAddress: SystemAddress): Promise<SystemAddress> {
        const newSystemAddress = new SystemAddress(systemAddress);
        return newSystemAddress;
    }

}
