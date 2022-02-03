/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../model/SysConfigOption';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../model/SysConfigKey';
import { SysConfigOptionDefinition } from '../../model/SysConfigOptionDefinition';

export class SysConfigService extends KIXObjectService<SysConfigOption> {

    private static INSTANCE: SysConfigService = null;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }

        return SysConfigService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.SYS_CONFIG_OPTION);
        this.objectConstructors.set(KIXObjectType.SYS_CONFIG_OPTION, [SysConfigOption]);
        this.objectConstructors.set(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, [SysConfigOptionDefinition]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public getLinkObjectName(): string {
        return 'SysConfig';
    }

    public async getTicketViewableStateTypes(): Promise<string[]> {
        const viewableStateTypes = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_VIEWABLE_STATE_TYPE],
            null, null, true
        ).catch(() => [] as SysConfigOption[]);

        const stateTypes: string[] = viewableStateTypes && viewableStateTypes.length ? viewableStateTypes[0].Value : [];

        return stateTypes && !!stateTypes.length ? stateTypes : ['new', 'open', 'pending reminder', 'pending auto'];
    }

    public async getSysconfigOptionValue<T = string>(key: string): Promise<T> {
        const config: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [key]
        ).catch((error): SysConfigOption[] => []);

        let value;

        if (Array.isArray(config) && config.length) {
            value = config[0].Value;
        }

        return value;
    }

}
