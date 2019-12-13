/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { SysConfigOption } from "../model/SysConfigOption";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";

export class SysConfigOptionFactory extends ObjectFactory<SysConfigOption> {

    public isFactoryFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    public async create(sysConfigOption?: SysConfigOption): Promise<SysConfigOption> {
        return new SysConfigOption(sysConfigOption);
    }



}
