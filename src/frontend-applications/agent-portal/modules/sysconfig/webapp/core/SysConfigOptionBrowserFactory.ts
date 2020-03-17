/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from "../../../../modules/base-components/webapp/core/KIXObjectFactory";
import { SysConfigOption } from "../../model/SysConfigOption";

export class SysConfigOptionBrowserFactory extends KIXObjectFactory<SysConfigOption> {

    private static INSTANCE: SysConfigOptionBrowserFactory;

    public static getInstance(): SysConfigOptionBrowserFactory {
        if (!SysConfigOptionBrowserFactory.INSTANCE) {
            SysConfigOptionBrowserFactory.INSTANCE = new SysConfigOptionBrowserFactory();
        }
        return SysConfigOptionBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(sysConfig: SysConfigOption): Promise<SysConfigOption> {
        const newSysConfig = new SysConfigOption(sysConfig);
        return newSysConfig;
    }

}
