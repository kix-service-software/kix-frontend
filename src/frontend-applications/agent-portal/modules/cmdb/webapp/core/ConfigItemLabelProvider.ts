/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { ConfigItem } from '../../model/ConfigItem';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../model/ConfigItemClass';
import { GeneralCatalogItem } from '../../../general-catalog/model/GeneralCatalogItem';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { VersionProperty } from '../../model/VersionProperty';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { Label } from '../../../base-components/webapp/core/Label';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ConfigItemLabelProvider extends LabelProvider<ConfigItem> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public isLabelProviderForDFType(dfFieldType: string): boolean {
        return dfFieldType === DynamicFieldTypes.CI_REFERENCE || super.isLabelProviderForDFType(dfFieldType);
    }

    public async getPropertyValueDisplayText(
        property: string, value: any = '', translatable: boolean = true
    ): Promise<string> {
        let displayValue = '';
        switch (property) {
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
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
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
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONFIG_ITEM_HOOK], null, null, true
                ).catch((error): SysConfigOption[] => []);
                displayValue = hookConfig && hookConfig.length ? hookConfig[0].Value : 'CI#';
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
                if (configItem.CurDeplState) {
                    displayValue = configItem.CurDeplState;
                } else if (displayValue) {
                    displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
                    translatable = false;
                }
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                if (configItem.CurInciState) {
                    displayValue = configItem.CurInciState;
                } else if (displayValue) {
                    displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
                    translatable = false;
                }
                break;
            case ConfigItemProperty.NAME:
                displayValue = configItem.Name;
                break;
            case ConfigItemProperty.NUMBER:
                displayValue = configItem.Number ?
                    configItem.Number : configItem.CurrentVersion ? configItem.CurrentVersion.Number : property;
                break;
            case ConfigItemProperty.CLASS_ID:
            case ConfigItemProperty.CLASS:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
                translatable = false;
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

    public isLabelProviderFor(object: ConfigItem | KIXObject): boolean {
        return object instanceof ConfigItem || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(configItem: ConfigItem, id: boolean = true, name: boolean = true): Promise<string> {
        let returnString = '';
        if (configItem) {
            let configItemHook: string = '';

            const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONFIG_ITEM_HOOK]
            ).catch((error): SysConfigOption[] => []);

            if (hookConfig && hookConfig.length) {
                configItemHook = hookConfig[0].Value;
            }

            returnString = `${configItemHook}${configItem.Number} - ${configItem.Name}`;
        }
        return returnString;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public async getObjectTooltip(configItem: ConfigItem, translatable: boolean = true): Promise<string> {
        const toolTip = configItem.CurrentVersion && configItem.CurrentVersion.Name ?
            configItem.CurrentVersion.Name : configItem.Number;
        if (translatable) {
            return await TranslationService.translate(toolTip);
        }
        return toolTip;
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
                icons.push(new ObjectIcon(null, KIXObjectType.GENERAL_CATALOG_ITEM, value));
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                icons.push(new ObjectIcon(null, KIXObjectType.GENERAL_CATALOG_ITEM, value));
                break;
            default:
        }
        return icons;
    }

    public async createLabelsFromDFValue(dfValue: DynamicFieldValue): Promise<Label[]> {
        const dynamicField = dfValue && dfValue.ID ? await KIXObjectService.loadDynamicField(
            dfValue.Name ? dfValue.Name : null,
            dfValue.ID ? Number(dfValue.ID) : null
        ) : null;

        if (dynamicField && dynamicField.FieldType === DynamicFieldTypes.CI_REFERENCE) {
            if (Array.isArray(dfValue.Value)) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, [ConfigItemProperty.CURRENT_VERSION, VersionProperty.PREPARED_DATA]
                );
                const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                    KIXObjectType.CONFIG_ITEM, dfValue.Value, loadingOptions
                ).catch((): ConfigItem[] => []);

                const labels = [];
                for (const ci of configItems) {
                    const ciIcon = new ObjectIcon(null, KIXObjectType.GENERAL_CATALOG_ITEM, ci.ClassID);
                    const incidentIcons = await LabelService.getInstance().getIcons(
                        ci, ConfigItemProperty.CUR_INCI_STATE_ID
                    );
                    const deploymentIcon = await LabelService.getInstance().getIcons(
                        ci, ConfigItemProperty.CUR_DEPL_STATE_ID
                    );
                    const label = new Label(ci, ci.ConfigItemID, ciIcon, ci.Name, null, ci.Name, true, [
                        ...incidentIcons, ...deploymentIcon
                    ],
                        {
                            title: 'Translatable#Asset',
                            content: 'config-item-info',
                            instanceId: 'config-item-info',
                            data: { configItem: ci },
                            large: true
                        }
                    );
                    labels.push(label);
                }

                return labels;
            }
        }
        return null;
    }
}
