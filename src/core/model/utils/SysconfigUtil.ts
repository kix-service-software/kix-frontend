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
