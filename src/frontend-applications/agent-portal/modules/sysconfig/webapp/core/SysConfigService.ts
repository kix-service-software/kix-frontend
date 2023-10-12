/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentPortalConfiguration } from '../../../../model/configuration/AgentPortalConfiguration';
import { DisplayValueConfiguration } from '../../../../model/configuration/DisplayValueConfiguration';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { SysConfigKey } from '../../model/SysConfigKey';
import { SysConfigOption } from '../../model/SysConfigOption';
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

    public async getSysConfigOptionValue<T = string>(key: string): Promise<T> {
        const config: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [key]
        ).catch((error): SysConfigOption[] => []);

        let value;

        if (Array.isArray(config) && config.length) {
            value = config[0].Value;
        }

        return value;
    }

    public async getPortalConfiguration<T = any>(): Promise<T> {
        let config: AgentPortalConfiguration;

        const value = await this.getSysConfigOptionValue(AgentPortalConfiguration.CONFIGURATION_ID)
            .catch(() => null);
        if (value) {
            try {
                config = JSON.parse(value);
            } catch (error) {
                console.error('Could not parse Agent Portal Configuration');
            }
        }

        return config as any;
    }

    public async getDisplayValueConfiguration(): Promise<DisplayValueConfiguration> {
        let config: DisplayValueConfiguration;

        const value = await this.getSysConfigOptionValue(KIXModulesService.displayValueConfigurationKey)
            .catch(() => null);
        if (value) {
            try {
                config = JSON.parse(value);
            } catch (error) {
                console.error('Could not parse Display Value Configuration');
            }
        }

        return config;
    }

    public async getDisplayValuePattern(objectType: KIXObjectType | string): Promise<string> {
        let pattern;

        const config = await SysConfigService.getInstance().getDisplayValueConfiguration();
        if (config) {
            const displayValue = config.displayValues?.find((dv) => dv.objectType === objectType);

            pattern = displayValue?.pattern;
        }

        return pattern;
    }

}
