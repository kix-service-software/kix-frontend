/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from "../../../../modules/base-components/webapp/core/KIXObjectFactory";
import { ConfigItemClass } from "../../model/ConfigItemClass";
import { ConfigItemClassFactory } from "../../server/ConfigItemClassFactory";

export class ConfigItemClassBrowserFactory extends KIXObjectFactory<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassBrowserFactory;

    public static getInstance(): ConfigItemClassBrowserFactory {
        if (!ConfigItemClassBrowserFactory.INSTANCE) {
            ConfigItemClassBrowserFactory.INSTANCE = new ConfigItemClassBrowserFactory();
        }
        return ConfigItemClassBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(configItemClass: ConfigItemClass): Promise<ConfigItemClass> {
        const newConfigItemClass = ConfigItemClassFactory.create(configItemClass);
        super.createPermissions(newConfigItemClass);
        return newConfigItemClass;
    }

}
