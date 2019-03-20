import { ILabelProvider } from '..';
import {
    ObjectIcon, KIXObjectType, ConfigItemProperty, ConfigItem,
    DateTimeUtil, ConfigItemClass, GeneralCatalogItem, KIXObject, SysConfigItem, SysConfigKey, VersionProperty
} from '../../model';
import { KIXObjectService } from '../kix';
import { SearchProperty } from '../SearchProperty';
import { TranslationService } from '../i18n/TranslationService';

export class ConfigItemLabelProvider implements ILabelProvider<ConfigItem> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public async getPropertyValueDisplayText(
        property: string, value: any = '', translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ConfigItemProperty.CREATE_TIME:
            case ConfigItemProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(value);
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
                    displayValue = value.length;
                }
                break;
            default:
                displayValue = value;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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
            case ConfigItemProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case ConfigItemProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case ConfigItemProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ConfigItemProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case ConfigItemProperty.VERSIONS:
                displayValue = 'Translatable#Number of version';
                break;
            case ConfigItemProperty.NUMBER:
                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.CONFIG_ITEM_HOOK]
                ).catch((error) => []);
                displayValue = hookConfig && hookConfig.length ? hookConfig[0].Data : 'CI#';
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
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
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
                    displayValue = await this.getPropertyValueDisplayText(property, displayValue);
                }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(configItem: ConfigItem, property: string): string[] {
        return [];
    }

    public getObjectClasses(configItem: ConfigItem): string[] {
        return [];
    }

    public isLabelProviderFor(configItem: ConfigItem): boolean {
        return configItem instanceof ConfigItem;
    }

    public async getObjectText(configItem: ConfigItem, id: boolean = true, name: boolean = true): Promise<string> {
        let returnString = '';
        if (configItem) {
            if (id) {
                let configItemHook: string = '';

                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.CONFIG_ITEM_HOOK]
                ).catch((error) => []);

                if (hookConfig && hookConfig.length) {
                    configItemHook = hookConfig[0].Data;
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

    public getObjectAdditionalText(configItem: ConfigItem): string {
        return null;
    }

    public getObjectIcon(configItem: ConfigItem): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(configItem: ConfigItem): string {
        return configItem.CurrentVersion && configItem.CurrentVersion.Name ?
            configItem.CurrentVersion.Name : configItem.Number;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Config Items' : 'Config Item';
        if (translatable) {
            displayValue = await TranslationService.translate('Translatable#' + displayValue);
        }
        return displayValue;
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
