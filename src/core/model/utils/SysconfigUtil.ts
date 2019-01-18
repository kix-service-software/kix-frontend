import { SysConfigItem, KIXObjectType, SysConfigKey } from '../kix';
import { KIXObjectService } from '../../browser';

export class SysconfigUtil {

    public static async isTimeAccountingEnabled(): Promise<boolean> {
        let enabled = false;
        const timeAccountingConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.ACCOUNT_TIME]
        );
        if (timeAccountingConfig && timeAccountingConfig[0]) {
            enabled = (timeAccountingConfig[0].Data && timeAccountingConfig[0].Data === '1');
        }

        return enabled;
    }

    public static async getTimeAccountingUnit(): Promise<string> {
        let unit = '';

        const timeAccountUnitConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.TIME_UNITS]
        );
        if (timeAccountUnitConfig && timeAccountUnitConfig.length) {
            unit = timeAccountUnitConfig[0].Data;
        }

        return unit;
    }

}
