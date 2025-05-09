/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentPortalConfiguration } from '../../../../model/configuration/AgentPortalConfiguration';
import { DisplayValueConfiguration } from '../../../../model/configuration/DisplayValueConfiguration';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { UIFilterCriterion } from '../../../../model/UIFilterCriterion';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';
import { SysConfigKey } from '../../model/SysConfigKey';
import { SysConfigOption } from '../../model/SysConfigOption';
import { SysConfigOptionDefinition } from '../../model/SysConfigOptionDefinition';
import { SysConfigOptionProperty } from '../../model/SysConfigOptionProperty';

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
        const config = this.getUIConfiguration<T>(AgentPortalConfiguration.CONFIGURATION_ID);
        return config as any;
    }

    public async getUIConfiguration<T = any>(configurationId: string): Promise<T> {
        let config: T;

        const value = await this.getSysConfigOptionValue(configurationId)
            .catch(() => null);
        if (value) {
            try {
                config = JSON.parse(value);
            } catch (error) {
                console.error('Could not parse configuration');
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

    public async updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {

        if (objectId.toString() === SysConfigKey.BROWSER_SOCKET_TIMEOUT_CONFIG) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(objectType, ServiceType.FORM);
            const parameter = await service.getFormParameter(true);
            const value = parameter.find((p) => p.includes('Value'));
            ClientStorageService.setSocketTimeout(value[1]);
        }

        return super.updateObjectByForm(objectType, formId, objectId, cacheKeyPrefix);
    }

    public async checkFilterValue(option: SysConfigOption, criteria: UIFilterCriterion): Promise<boolean> {
        let match = false;
        if (criteria.property === SysConfigOptionProperty.ID) {
            match = (criteria.value as []).some((id: number) => id === option.ID);
        } else {
            match = await super.checkFilterValue(option, criteria);
        }
        return match;
    }

}
