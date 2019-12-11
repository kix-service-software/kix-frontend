/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from "../../../../modules/base-components/webapp/core/LabelProvider";
import { ConfigItem } from "../../model/ConfigItem";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ConfigItemProperty } from "../../model/ConfigItemProperty";
import { DateTimeUtil } from "../../../../modules/base-components/webapp/core/DateTimeUtil";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { ConfigItemClass } from "../../model/ConfigItemClass";
import { GeneralCatalogItem } from "../../../general-catalog/model/GeneralCatalogItem";
import { TranslationService } from "../../../../modules/translation/webapp/core/TranslationService";
import { SysConfigOption } from "../../../sysconfig/model/SysConfigOption";
import { SysConfigKey } from "../../../sysconfig/model/SysConfigKey";
import { SearchProperty } from "../../../search/model/SearchProperty";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { VersionProperty } from "../../model/VersionProperty";

export class ConfigItemLabelProvider extends LabelProvider<ConfigItem> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public async getPropertyValueDisplayText(
        property: string, value: any = '', translatable: boolean = true
    ): Promise<string> {
        let displayValue = '';
        switch (property) {
            case ConfigItemProperty.CREATE_TIME:
            case ConfigItemProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(value);
                break;
            case ConfigItemProperty.CLASS_ID:
                const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                    KIXObjectType.CONFIG_ITEM_CLASS, [value], null
                );
                if (ciClasses && !!ciClasses.length) {
                    displayValue = ciClasses[0].Name;
                }
                break;
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                const deploymentItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, [value], null
                );
                if (deploymentItems && !!deploymentItems.length) {
                    displayValue = deploymentItems[0].Name;
                }
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                const incidentItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, [value], null
                );
                if (incidentItems && !!incidentItems.length) {
                    displayValue = incidentItems[0].Name;
                }
                break;
            case ConfigItemProperty.VERSIONS:
                if (value && Array.isArray(value)) {
                    displayValue = value.length.toString();
                }
                break;
            default:
                displayValue = value;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemProperty.CLASS:
            case ConfigItemProperty.CLASS_ID:
                displayValue = 'Translatable#Class';
                break;
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                displayValue = 'Translatable#Current deployment state';
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                displayValue = 'Translatable#Current incident state';
                break;
            case ConfigItemProperty.VERSIONS:
                displayValue = 'Translatable#Number of version';
                break;
            case ConfigItemProperty.NUMBER:
                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONFIG_ITEM_HOOK]
                ).catch((error): SysConfigOption[] => []);
                displayValue = hookConfig && hookConfig.length ? hookConfig[0].Value : 'CI#';
                break;
            case 'LinkedAs':
                displayValue = 'Translatable#Linked as';
                break;
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case ConfigItemProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue.toString();
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        let icon = property;
        switch (property) {
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                icon = 'kix-icon-productive_active';
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                icon = 'kix-icon-service_active';
                break;
            default:
        }
        return icon;
    }

    public async getDisplayText(
        configItem: ConfigItem, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = configItem[property];

        switch (property) {
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                displayValue = configItem.CurDeplState;
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                displayValue = configItem.CurInciState;
                break;
            case ConfigItemProperty.CREATE_BY:
                displayValue = configItem.createdBy ? configItem.createdBy.UserFullname : configItem.CreateBy;
                break;
            case ConfigItemProperty.CHANGE_BY:
                displayValue = configItem.changedBy ? configItem.changedBy.UserFullname : configItem.ChangeBy;
                break;
            case VersionProperty.NAME:
                displayValue = configItem.CurrentVersion ? configItem.CurrentVersion.Name : property;
                break;
            case ConfigItemProperty.NUMBER:
                displayValue = configItem.Number ?
                    configItem.Number : configItem.CurrentVersion ? configItem.CurrentVersion.Number : property;
                break;
            case ConfigItemProperty.CLASS_ID:
            case ConfigItemProperty.CLASS:
            case ConfigItemProperty.CHANGE_BY:
            case ConfigItemProperty.CHANGE_TIME:
            case ConfigItemProperty.CREATE_BY:
            case ConfigItemProperty.CREATE_TIME:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
                break;
            default:
                const attributes = configItem.getPreparedData(property);
                if (attributes && attributes.length > 0) {
                    if (attributes.length > 1) {
                        displayValue = attributes.map((a) => `[${a.DisplayValue}]`).join(' ');
                    } else {
                        displayValue = attributes[0].DisplayValue;
                    }
                } else {
                    displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(configItem: ConfigItem): boolean {
        return configItem instanceof ConfigItem;
    }

    public async getObjectText(configItem: ConfigItem, id: boolean = true, name: boolean = true): Promise<string> {
        let returnString = '';
        if (configItem) {
            if (id) {
                let configItemHook: string = '';

                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONFIG_ITEM_HOOK]
                ).catch((error): SysConfigOption[] => []);

                if (hookConfig && hookConfig.length) {
                    configItemHook = hookConfig[0].Value;
                }

                returnString = `${configItemHook}${configItem.Number}`;
            }
            if (name && configItem.CurrentVersion && configItem.CurrentVersion.Name) {
                returnString += (id ? ' - ' : '') + configItem.CurrentVersion.Name;
            }
        } else {
            returnString = await this.getObjectName(false);
        }
        return returnString;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(configItem: ConfigItem): string {
        return configItem.CurrentVersion && configItem.CurrentVersion.Name ?
            configItem.CurrentVersion.Name : configItem.Number;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Config Items' : 'Translatable#Config Item'
            );
        }
        return plural ? 'Config Items' : 'Config Item';
    }

    public async getIcons(
        configItem: ConfigItem, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        const icons = [];

        if (configItem) {
            value = configItem[property];
        }

        switch (property) {
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                icons.push(new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, value));
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                icons.push(new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, value));
                break;
            default:
        }
        return icons;
    }
}