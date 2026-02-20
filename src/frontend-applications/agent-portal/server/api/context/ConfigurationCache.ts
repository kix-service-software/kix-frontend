import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { PluginService } from '../../../../../server/services/PluginService';
import { ContextConfiguration } from '../../../model/configuration/ContextConfiguration';
import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { SearchOperator } from '../../../modules/search/model/SearchOperator';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';
import { SysConfigOptionProperty } from '../../../modules/sysconfig/model/SysConfigOptionProperty';
import { SysConfigService } from '../../../modules/sysconfig/server/SysConfigService';
import { AgentPortalExtensions } from '../../extensions/AgentPortalExtensions';
import { IMarkoApplication } from '../../extensions/IMarkoApplication';
import { CacheService } from '../../services/cache';
import { ContextConfigurationResolver } from '../../services/configuration/ContextConfigurationResolver';
import { ObjectResponse } from '../../services/ObjectResponse';

export class ConfigurationCache {

    private static INSTANCE: ConfigurationCache;

    public static getInstance(): ConfigurationCache {
        if (!ConfigurationCache.INSTANCE) {
            ConfigurationCache.INSTANCE = new ConfigurationCache();
        }
        return ConfigurationCache.INSTANCE;
    }

    private constructor() { }

    private rebuildPromise: Promise<void>;

    protected initialize(): Promise<void> {
        CacheService.getInstance().adddIgnorePrefixes(['ContextConfiguration']);
        return this.rebuildConfigCache();
    }

    public async rebuildConfigCache(): Promise<void> {
        if (!this.rebuildPromise) {
            // eslint-disable-next-line no-async-promise-executor
            this.rebuildPromise = new Promise<void>(async (resolve, reject) => {
                const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
                    AgentPortalExtensions.MARKO_APPLICATION
                );

                for (const application of applications) {
                    await this.rebuildApplicationConfigurations(application);
                }

                this.rebuildPromise = null;
                resolve();
            });
        }

        return this.rebuildPromise;
    }

    // eslint-disable-next-line max-lines-per-function
    private async rebuildApplicationConfigurations(application: IMarkoApplication): Promise<void> {
        await CacheService.getInstance().deleteKeys(`${application.name}ContextConfiguration`, true);
        const beToken = ConfigurationService.getBackendAPIToken();

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.OR, application.name
            )
        ], null, 0);

        const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            beToken, 'ContextConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
            loadingOptions, null
        ).catch(() => new ObjectResponse<SysConfigOption>());

        const options = objectResponse?.objects || [];
        const contextOptions = options.filter((c) => c.ContextMetadata === 'Context');

        LoggingService.getInstance().info(`${application.name}: Build ${contextOptions.length} context configurations.`);

        for (const contextOption of contextOptions) {
            if (contextOption.Value) {
                const newConfig = await ContextConfigurationResolver.getInstance().resolve(
                    beToken,
                    JSON.parse(contextOption.Value) as ContextConfiguration,
                    options
                );

                CacheService.getInstance().set(
                    newConfig.contextId, newConfig, `${application.name}ContextConfiguration`
                );
            }
        }
    }

}