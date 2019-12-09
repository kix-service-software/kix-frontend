/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigItemClass } from "../model/ConfigItemClass";

export class ConfigItemClassFactory {

    public static create(_configItemClass: ConfigItemClass): ConfigItemClass {
        const configItemClass = new ConfigItemClass(_configItemClass);
        return configItemClass;
    }

}
