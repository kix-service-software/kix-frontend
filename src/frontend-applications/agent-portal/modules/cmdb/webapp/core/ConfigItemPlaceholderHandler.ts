/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SortUtil } from '../../../../model/SortUtil';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { IPlaceholderHandler } from '../../../base-components/webapp/core/IPlaceholderHandler';
import { ConfigItem } from '../../model/ConfigItem';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { PreparedData } from '../../model/PreparedData';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { VersionProperty } from '../../model/VersionProperty';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';

export class ConfigItemPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '070-ConfigItemPlaceholderHandler';
    protected objectStrings: string[] = [
        'ASSET'
    ];

    private static INSTANCE: ConfigItemPlaceholderHandler;

    public static getInstance(): ConfigItemPlaceholderHandler {
        if (!ConfigItemPlaceholderHandler.INSTANCE) {
            ConfigItemPlaceholderHandler.INSTANCE = new ConfigItemPlaceholderHandler();
        }
        return ConfigItemPlaceholderHandler.INSTANCE;
    }

    private extendedPlaceholderHandler: IPlaceholderHandler[] = [];

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.CONFIG_ITEM;
    }

    public isHandlerForDFType(dfFieldType: string): boolean {
        return dfFieldType === DynamicFieldTypes.CI_REFERENCE;
    }

    public addExtendedPlaceholderHandler(handler: IPlaceholderHandler): void {
        this.extendedPlaceholderHandler.push(handler);
    }

    public async replaceDFObjectPlaceholder(
        attributePath: string, assetId: number, language?: string
    ): Promise<string> {
        let result: string = '';
        if (assetId) {
            const asset = await this.loadAssetWithCurrentVersion(assetId);
            if (asset) {
                result = await this.replace(`<KIX_ASSET_${attributePath}>`, asset, language);
            }
        }
        return result;
    }

    public async replace(placeholder: string, asset?: ConfigItem, language?: string): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        if (asset && this.isHandlerFor(objectString)) {
            if (!asset) {
                asset = new ConfigItem();
                await this.prepareObject(asset);
            } else if (!asset.CurrentVersion && !asset.Versions?.length && asset.ConfigItemID) {
                const loadedAsset = await this.loadAssetWithCurrentVersion(asset.ConfigItemID);
                asset.CurrentVersion = loadedAsset?.CurrentVersion;
            }
            if (asset) {
                // do not use "getAttributeString"
                // because it would only be "ParentAttribute" if placeholder is "PatentAttribute_0_SubAttribute_0_Value"
                // so take full attribute "path"
                let attribute: string = placeholder.replace(
                    PlaceholderService.getInstance().getPlaceholderRegex(), '$2'
                );
                if (attribute) {
                    let handlerHandledId: boolean = false;
                    if (this.extendedPlaceholderHandler.length && placeholder) {
                        const handler = SortUtil.sortObjects(this.extendedPlaceholderHandler, 'handlerId').find(
                            (ph) => ph.isHandlerFor(placeholder)
                        );
                        if (handler) {
                            result = await handler.replace(placeholder, asset, language);
                            handlerHandledId = true;
                        }
                    }
                    if (!handlerHandledId) {
                        if (attribute === 'ID') {
                            attribute = ConfigItemProperty.CONFIG_ITEM_ID;
                        }
                        switch (attribute) {
                            case ConfigItemProperty.CONFIG_ITEM_ID:
                            case ConfigItemProperty.NUMBER:
                            case ConfigItemProperty.NAME:
                            case ConfigItemProperty.CLASS_ID:
                            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                            case ConfigItemProperty.CUR_INCI_STATE_ID:
                                result = asset[attribute] ? asset[attribute].toString() : '';
                                break;
                            case ConfigItemProperty.CLASS:
                            case ConfigItemProperty.CUR_DEPL_STATE:
                            case ConfigItemProperty.CUR_DEPL_STATE_TYPE:
                            case ConfigItemProperty.CUR_INCI_STATE:
                            case ConfigItemProperty.CUR_INCI_STATE_TYPE:
                                const value = asset[attribute] ? asset[attribute].toString() : '';
                                result = await TranslationService.translate(value, undefined, language);
                                break;
                            case ConfigItemProperty.CHANGE_BY:
                            case ConfigItemProperty.CHANGE_TIME:
                            case ConfigItemProperty.CREATE_BY:
                            case ConfigItemProperty.CREATE_TIME:
                                result = await LabelService.getInstance().getDisplayText(
                                    asset, attribute, undefined, false
                                );
                                break;
                            default:
                                const placeholderMap = new Map();
                                let version = asset.CurrentVersion;
                                if (!version && asset.Versions?.length && asset.LastVersionID) {
                                    version = asset.Versions.find((v) => v.VersionID === asset.LastVersionID);
                                }
                                await this.preparedData(version?.PreparedData, placeholderMap);
                                if (placeholderMap.has(attribute)) {
                                    result = placeholderMap.get(attribute);
                                }

                        }
                    }
                }
            }
        }
        return result;
    }

    private async loadAssetWithCurrentVersion(assetId: number): Promise<ConfigItem> {
        let asset: ConfigItem;
        if (assetId) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [ConfigItemProperty.CURRENT_VERSION, VersionProperty.PREPARED_DATA];
            const assets = await KIXObjectService.loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, [assetId], loadingOptions
            ).catch(() => []);
            if (assets?.length && assets[0]) {
                asset = assets[0];
            }
        }
        return asset;

    }

    public async preparedData(data: PreparedData[], resultData: Map<string, string>, parent: string = ''): Promise<void> {
        if (data) {
            const attributeCounter = new Map();
            const preparePromises = [];
            data.forEach((attribute) => {
                const attributeName = `${parent}${attribute.Key}`;
                const counter: number = attributeCounter.has(attributeName) ?
                    (attributeCounter.get(attributeName) + 1) : 0;
                attributeCounter.set(attributeName, counter);
                const attributeNameIndex = `${parent}${attribute.Key}_${counter}`;

                preparePromises.push(
                    this.getPreparePromise(attribute, resultData, attributeNameIndex, attributeName)
                );
            });
            await Promise.all(preparePromises);
        }
    }

    private getPreparePromise(
        attribute: PreparedData, resultData: Map<string, string>, attributeNameIndex: string, attributeName: string
    ): Promise<void> {
        return new Promise<void>(async (resolve) => {
            let key: string;
            let value: string;
            if (attribute.Type === 'Attachment') {
                if (attribute.Value?.Filename) {
                    value = attribute.Value.Filename;
                    key = attribute.Value.AttachmentID;
                }
            } else if (attribute.Value) {
                value = attribute.DisplayValue;
                key = attribute.Value;
                if (attribute.Type === 'Date') {
                    value = await DateTimeUtil.getLocalDateString(value);
                } else if (attribute.Type === 'DateTime') {
                    value = await DateTimeUtil.getLocalDateTimeString(value);
                } else if (![
                    'Text', 'TextArea',
                    'CIClassReference', 'TicketReference',
                    'Contact', 'Organisation', 'User',
                    'EncryptedText'
                ].includes(attribute.Type)) {
                    value = await TranslationService.translate(value);
                }
            }

            if (typeof value !== 'undefined') {
                resultData.set(attributeNameIndex, value);
                resultData.set(`${attributeNameIndex}_Value`, value);
                resultData.set(`${attributeNameIndex}_Key`, key);
                if (!resultData.has(attributeName)) {
                    resultData.set(attributeName, value);
                    resultData.set(`${attributeName}_Values`, value);
                    resultData.set(`${attributeName}_Keys`, key);
                } else {
                    const newValues = resultData.get(attributeName) + ', ' + value;
                    resultData.set(attributeName, newValues);
                    resultData.set(`${attributeName}_Values`, newValues);
                    const newKeys = resultData.get(`${attributeName}_Keys`) + ', ' + key;
                    resultData.set(`${attributeName}_Keys`, newKeys);
                }
            }

            if (attribute.Sub) {
                await this.preparedData(attribute.Sub, resultData, `${attributeNameIndex}_`);
            }
            resolve();
        });
    }
}
