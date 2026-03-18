/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { SearchOperator } from '../../../modules/search/model/SearchOperator';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';
import { SysConfigOptionProperty } from '../../../modules/sysconfig/model/SysConfigOptionProperty';
import { SysConfigService } from '../../../modules/sysconfig/server/SysConfigService';
import { CacheService } from '../../services/cache';
import { FormConfigurationResolver } from '../../services/configuration/FormConfigurationResolver';

export class ConfigurationBuilder {

    private static INSTANCE: ConfigurationBuilder;

    public static getInstance(): ConfigurationBuilder {
        if (!ConfigurationBuilder.INSTANCE) {
            ConfigurationBuilder.INSTANCE = new ConfigurationBuilder();
        }
        return ConfigurationBuilder.INSTANCE;
    }

    private constructor() { }

    private rebuildPromise: Promise<void>;

    public initialize(): Promise<void> {
        CacheService.getInstance().adddIgnorePrefixes(['FormConfiguration']);
        return this.rebuildConfigCache();
    }

    public async rebuildConfigCache(): Promise<void> {
        if (!this.rebuildPromise) {
            // eslint-disable-next-line no-async-promise-executor
            this.rebuildPromise = new Promise<void>(async (resolve, reject) => {
                await CacheService.getInstance().deleteKeys('FormConfiguration', true);

                const beToken = ConfigurationService.getBackendAPIToken();

                const options = await this.loadFormOptions();
                const formOptions = options.filter((c) => c.ContextMetadata === 'Form');

                LoggingService.getInstance().info(`Build ${formOptions.length} form configurations.`);

                for (const formOption of formOptions) {

                    if (formOption.Value) {
                        const newConfig = await FormConfigurationResolver.resolve(
                            beToken, JSON.parse(formOption.Value), options
                        ).catch((error): FormConfiguration => {
                            LoggingService.getInstance().error(error);
                            LoggingService.getInstance().warning(
                                'Could not resolve form configuration ' + formOption.Name
                            );
                            return null;
                        });

                        CacheService.getInstance().set(
                            `FormConfiguration${formOption.Name}`, newConfig, 'FormConfiguration'
                        );
                    }
                }

                this.rebuildPromise = null;
                resolve();
            });
        }
        return this.rebuildPromise;
    }

    private async loadFormOptions(): Promise<SysConfigOption[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'agent-portal'
            )
        ], null, 0);

        const beToken = ConfigurationService.getBackendAPIToken();

        const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            beToken, 'FormConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
            loadingOptions, null
        );

        const options = objectResponse?.objects || [];
        return options;
    }

}