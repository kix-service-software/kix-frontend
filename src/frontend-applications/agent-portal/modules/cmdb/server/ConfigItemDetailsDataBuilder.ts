/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectInformationWidgetConfiguration } from '../../../model/configuration/ObjectInformationWidgetConfiguration';
import { IdService } from '../../../model/IdService';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { LabelValueGroup } from '../../../model/LabelValueGroup';
import { LabelValueGroupValue } from '../../../model/LabelValueGroupValue';
import { SortUtil } from '../../../model/SortUtil';
import { ModuleConfigurationService } from '../../../server/services/configuration/ModuleConfigurationService';
import { DateTimeAPIUtil } from '../../../server/services/DateTimeAPIUtil';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { SysConfigKey } from '../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../sysconfig/model/SysConfigOption';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { TranslationAPIService } from '../../translation/server/TranslationService';
import { User } from '../../user/model/User';
import { UserProperty } from '../../user/model/UserProperty';
import { UserService } from '../../user/server/UserService';
import { ConfigItem } from '../model/ConfigItem';
import { ConfigItemClass } from '../model/ConfigItemClass';
import { ConfigItemProperty } from '../model/ConfigItemProperty';
import { PreparedData } from '../model/PreparedData';
import { Version } from '../model/Version';
import { VersionProperty } from '../model/VersionProperty';
import { CMDBAPIService } from './CMDBService';
import { ExtendedConfigItemDetailsDataBuilder } from './ExtendedConfigItemDetailsDataBuilder';


export class ConfigItemDetailsDataBuilder {

    public static async buildCIData(token: string, configItemId: number, versionIds?: number[]): Promise<any> {
        versionIds = versionIds || [];
        const data = {};
        const ci = await this.loadConfigItem(token, configItemId);
        if (ci) {
            data['name'] = ci.Name;
            data['properties'] = await this.getCIProperties(token, ci);
            data['currentVersion'] = [];
            data['nonCurrentVersions'] = [];
            data['currentVersionPreparedData'] = [];
            data['nonCurrentVersionsPreparedData'] = [];

            let versions = ci.Versions.sort((v1, v2) => v2.VersionID - v1.VersionID);

            for (let i = 0; i < versions.length; i++) {
                versions[i].countNumber = versions.length - i;
            }

            versions = versions
                .filter((v) => versionIds.length === 0 || versionIds.includes(v.VersionID))
                .sort((v1, v2) => v2.countNumber - v1.countNumber);

            const currentVersion = versions.find((v) => v.IsLastVersion);
            if (currentVersion) {
                data['currentVersion'] = await this.getVersionProperties(token, currentVersion);
                data['currentVersionPreparedData'] =
                    await this.transformPreparedDataToLabelGroup(token, currentVersion.PreparedData);
            }

            const nonCurrentVersions = versions
                .filter((v) => !v.IsLastVersion);

            for (const version of nonCurrentVersions) {
                data['nonCurrentVersions'].push(await this.getVersionProperties(token, version));
                data['nonCurrentVersionsPreparedData'].push(
                    await this.transformPreparedDataToLabelGroup(token, version.PreparedData));
            }
        }
        return data;
    }

    private static extendedDataBuilders: ExtendedConfigItemDetailsDataBuilder[] = [];

    public static registerExtendedConfigItemDataBuilder(dataBuilder: ExtendedConfigItemDetailsDataBuilder): void {
        if (dataBuilder) {
            this.extendedDataBuilders.push(dataBuilder);
        }
    }

    private static async loadConfigItem(token: string, configItemId: number): Promise<ConfigItem> {
        let ci: ConfigItem;
        if (token && configItemId) {
            const requestId = IdService.generateDateBasedId();
            const objectResponse = await CMDBAPIService.getInstance().loadObjects<ConfigItem>(
                token, requestId, KIXObjectType.CONFIG_ITEM, [configItemId],
                new KIXObjectLoadingOptions(null, null, null, [
                    ConfigItemProperty.CURRENT_VERSION,
                    ConfigItemProperty.VERSIONS,
                    VersionProperty.PREPARED_DATA
                ]),
                undefined
            ).catch(() => new ObjectResponse<ConfigItem>());
            const configItems = objectResponse?.objects || [];
            ci = configItems && configItems.length ? configItems[0] : null;
        }
        return ci;
    }

    private static async getCIProperties(token: string, configItem: ConfigItem): Promise<Array<[string, any]>> {
        const properties = [];

        const configuration =
            await ModuleConfigurationService.getInstance().loadConfiguration<ObjectInformationWidgetConfiguration>(
                token, 'config-item-details-print-config'
            );

        if (configuration && configuration.properties) {
            for (const property of configuration.properties) {
                let value;

                switch (property) {
                    case ConfigItemProperty.CHANGE_TIME:
                    case ConfigItemProperty.CREATE_TIME:
                        value = await DateTimeAPIUtil.getLocalDateTimeString(token, configItem[property]) ||
                            configItem[property];
                        break;
                    case ConfigItemProperty.CHANGE_BY:
                    case ConfigItemProperty.CREATE_BY:
                        const usersDisplayValue = await this.loadObjectDisplayValue<User>(
                            token, UserService.getInstance(), configItem[property], KIXObjectType.USER,
                            [UserProperty.CONTACT]
                        );
                        value = usersDisplayValue && usersDisplayValue.Contact
                            ? usersDisplayValue.Contact.Fullname : usersDisplayValue
                                ? usersDisplayValue.UserLogin : configItem[property];
                        break;
                    case ConfigItemProperty.CLASS_ID:
                        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                            KIXObjectType.CONFIG_ITEM_CLASS, [configItem[property]], null
                        );
                        value = ciClasses && !!ciClasses.length ? ciClasses[0].Name : configItem[property];
                        break;
                    case ConfigItemProperty.CUR_DEPL_STATE_ID:
                        value = await TranslationAPIService.getInstance().translate(
                            configItem.CurDeplState,
                            [],
                            await TranslationAPIService.getUserLanguage(token));
                        break;
                    case ConfigItemProperty.CUR_INCI_STATE_ID:
                        value = await TranslationAPIService.getInstance().translate(
                            configItem.CurInciState,
                            [],
                            await TranslationAPIService.getUserLanguage(token));
                        break;
                    case ConfigItemProperty.NUMBER:
                        const hookConfig = await this.loadObjectDisplayValue<SysConfigOption>(token,
                            SysConfigService.getInstance(), SysConfigKey.CONFIG_ITEM_HOOK,
                            KIXObjectType.SYS_CONFIG_OPTION);
                        value = (hookConfig?.Value || 'CI#') + configItem[property];
                        break;
                    default:
                        value = configItem[property];
                        break;
                }

                const propertyText = await this.getPropertyText(token, property);
                properties.push([propertyText, value]);
            }
        }

        return properties.sort((a: string[], b: string[]) => SortUtil.compareString(a[0], b[0]));
    }

    private static async getPropertyText(token: string, property: string): Promise<string> {
        for (const builder of this.extendedDataBuilders) {
            const result = await builder.getPropertyText(token, property);
            if (typeof result !== 'undefined' && result !== null) {
                return result;
            }
        }

        let displayValue = property;
        switch (property) {
            case ConfigItemProperty.CLASS:
                displayValue = 'Translatable#Config Item Class';
                break;
            case ConfigItemProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case ConfigItemProperty.NUMBER:
                displayValue = 'Translatable#Number';
                break;
            case ConfigItemProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ConfigItemProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case ConfigItemProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case ConfigItemProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                displayValue = 'Translatable#Current incident state';
                break;
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                displayValue = 'Translatable#Current deployment state';
                break;
            case ConfigItemProperty.CURRENT_VERSION:
                displayValue = 'Translatable#Current version';
                break;
            case ConfigItemProperty.CONFIG_ITEM_ID:
                displayValue = 'Translatable#Config Item ID';
                break;
            case VersionProperty.VERSION_ID:
                displayValue = 'Translatable#Version ID';
                break;
            case VersionProperty.COUNT_NUMBER:
                displayValue = 'Translatable#Version';
                break;
            default:
                break;
        }

        if (displayValue) {
            const language = await TranslationAPIService.getUserLanguage(token);
            displayValue = await TranslationAPIService.getInstance().translate(displayValue.toString(), [], language);
        }

        return displayValue;
    }

    private static async loadObjectDisplayValue<T extends KIXObject>(
        token: string, service: KIXObjectAPIService, id: number | string, objectType: KIXObjectType,
        includes?: string[]
    ): Promise<T> {
        let loadingOptions: KIXObjectLoadingOptions;

        if (includes && includes.length) {
            loadingOptions = new KIXObjectLoadingOptions(null, null, null, includes);
        }

        const objectResponse = await service.loadObjects(
            token, '', objectType, [id], loadingOptions, null
        ).catch((error) => new ObjectResponse());

        const objects = objectResponse?.objects || [];
        return objects && !!objects.length ? objects[0] : null;
    }

    private static async getVersionProperties(token: string, version: Version): Promise<Array<[string, any]>> {
        const properties = [];

        const configuration =
            await ModuleConfigurationService.getInstance().loadConfiguration<ObjectInformationWidgetConfiguration>(
                token, 'config-item-version-details-print-config'
            );

        if (configuration && configuration.properties) {
            for (const property of configuration.properties) {
                let value;

                switch (property) {
                    case VersionProperty.CREATE_TIME:
                        value = await DateTimeAPIUtil.getLocalDateTimeString(token, version[property]) ||
                            version[property];
                        break;
                    case VersionProperty.CREATE_BY:
                        const object = await this.loadObjectDisplayValue<User>(
                            token, UserService.getInstance(), version[property], KIXObjectType.USER,
                            [UserProperty.CONTACT]
                        );
                        value = object && object.Contact
                            ? object.Contact.Fullname
                            : object ? object.UserLogin : version[property];
                        break;
                    case VersionProperty.CLASS_ID:
                        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                            KIXObjectType.CONFIG_ITEM_CLASS, [version[property]], null
                        );
                        value = ciClasses && !!ciClasses.length ? ciClasses[0].Name : version[property];
                        break;
                    case VersionProperty.NUMBER:
                        const hookConfig = await this.loadObjectDisplayValue<SysConfigOption>(token,
                            SysConfigService.getInstance(), SysConfigKey.CONFIG_ITEM_HOOK,
                            KIXObjectType.SYS_CONFIG_OPTION);
                        value = (hookConfig?.Value || 'CI#') + version[property];
                        break;
                    case ConfigItemProperty.CUR_DEPL_STATE_ID:
                        value = await TranslationAPIService.getInstance().translate(
                            version.CurDeplState,
                            [],
                            await TranslationAPIService.getUserLanguage(token));
                        break;
                    case ConfigItemProperty.CUR_INCI_STATE_ID:
                        value = await TranslationAPIService.getInstance().translate(
                            version.CurInciState,
                            [],
                            await TranslationAPIService.getUserLanguage(token));
                        break;
                    default:
                        value = version[property];
                        break;
                }

                const propertyText = await this.getPropertyText(token, property);
                properties.push([propertyText, value]);
            }
        }

        return properties;
    }

    private static async transformPreparedDataToLabelGroup(
        token: string,
        data: PreparedData[],
        language?: string
    ): Promise<Array<[string, any]>> {

        language = language || await TranslationAPIService.getUserLanguage(token);
        const labelGroups = [];

        if (data) {
            for (const attribute of data) {
                let subGroups = null;
                if (attribute.Sub) {
                    subGroups = await this.transformPreparedDataToLabelGroup(token, attribute.Sub, language);
                }
                const label = await TranslationAPIService.getInstance().translate(attribute.Label, [], language);
                const displayValue =
                    await TranslationAPIService.getInstance().translate(attribute.DisplayValue, [], language);
                labelGroups.push(new LabelValueGroup(
                    label, new LabelValueGroupValue(displayValue), null, null, subGroups
                ));
            }
        }
        return labelGroups;
    }


}
