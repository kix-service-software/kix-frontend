/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SysConfigOption, KIXObjectType, SysConfigKey } from '../kix';
import { KIXObjectService } from '../../browser';

export class SysconfigUtil {

    public static async isTimeAccountingEnabled(): Promise<boolean> {
        let enabled = false;
        const timeAccountingConfig = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ACCOUNT_TIME]
        );
        if (timeAccountingConfig && timeAccountingConfig[0]) {
            enabled = (timeAccountingConfig[0].Value && timeAccountingConfig[0].Value === '1');
        }

        return enabled;
    }

    public static async getTimeAccountingUnit(): Promise<string> {
        let unit = '';

        const timeAccountUnitConfig = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TIME_UNITS]
        );
        if (timeAccountUnitConfig && timeAccountUnitConfig.length) {
            unit = timeAccountUnitConfig[0].Value;
        }

        return unit;
    }

}
