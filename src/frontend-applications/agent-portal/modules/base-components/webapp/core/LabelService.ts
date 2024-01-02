/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { Label } from './Label';
import { KIXObjectService } from './KIXObjectService';
import { ILabelProvider } from './ILabelProvider';
import { LabelProvider } from './LabelProvider';
import { EventService } from './EventService';

export class LabelService {

    private static INSTANCE: LabelService;

    public static getInstance(): LabelService {
        if (!LabelService.INSTANCE) {
            LabelService.INSTANCE = new LabelService();
        }
        return LabelService.INSTANCE;
    }

    private constructor() {
        EventService.getInstance().subscribe('USER_LANGUAGE_CHANGED', {
            eventSubscriberId: 'LabelService',
            eventPublished: async (data: any) => {
                this.displayValueCache.clear();
                this.requestDisplayValuePromises.clear();
            }
        });
    }

    // eslint-disable-next-line max-len
    private propertiesLabelProvider: Map<KIXObjectType | string, Map<string, ILabelProvider<any>>> = new Map();
    private objectLabelProvider: Array<ILabelProvider<any>> = [];

    private requestDisplayValuePromises: Map<string, Promise<string>> = new Map();
    private requestIconPromises: Map<string, Promise<Array<ObjectIcon | string>>> = new Map();

    private displayValueCache: Map<KIXObjectType | string, Map<string, Map<any, string>>> = new Map();
    // eslint-disable-next-line max-len
    private displayIconCache: Map<KIXObjectType | string, Map<string, Map<any, Array<ObjectIcon | string>>>> = new Map();


    public clearDisplayValueCache(objectType: KIXObjectType | string): void {
        this.displayIconCache.delete(objectType);
        this.requestIconPromises.delete(objectType);
        this.displayValueCache.delete(objectType);
        this.requestDisplayValuePromises.delete(objectType);
    }

    public registerLabelProvider<T>(labelProvider: ILabelProvider<T>): void {
        if (!this.objectLabelProvider.some((lp) => lp.isLabelProviderForType(labelProvider.kixObjectType))) {
            this.objectLabelProvider.push(labelProvider);
        }

        const objectType = labelProvider.kixObjectType;
        if (!this.propertiesLabelProvider.has(objectType)) {
            this.propertiesLabelProvider.set(objectType, new Map());
        }

        for (const property of labelProvider.getSupportedProperties()) {
            this.propertiesLabelProvider.get(objectType).set(property, labelProvider);
        }
    }

    public registerExtendedLabelProvider(labelProvider: ILabelProvider): void {
        const objectType = labelProvider.kixObjectType;
        if (!this.propertiesLabelProvider.has(objectType)) {
            this.propertiesLabelProvider.set(objectType, new Map());
        }

        for (const property of labelProvider.getSupportedProperties()) {
            this.propertiesLabelProvider.get(objectType).set(property, labelProvider);
        }
    }

    public getLabelProvider<T extends KIXObject>(object: T): ILabelProvider<T> {
        return this.objectLabelProvider.find((lp) => object && lp.isLabelProviderFor(object));
    }

    public getLabelProviderForProperty<T extends KIXObject>(object: T, property: string): ILabelProvider<T> {
        let labelProvider: ILabelProvider<T>;
        const propertiesMap = this.propertiesLabelProvider.get(object.KIXObjectType);
        if (propertiesMap) {
            labelProvider = propertiesMap.get(property);
        }
        return labelProvider;
    }

    public getLabelProviderForType<T extends ILabelProvider>(objectType: KIXObjectType | string): T {
        return this.objectLabelProvider.find((lp) => lp.isLabelProviderForType(objectType)) as any;
    }

    public async getDisplayText<T extends KIXObject>(
        object: T, property: string, defaultValue?: string, translatable: boolean = true,
        short?: boolean
    ): Promise<string> {

        let displayValue;
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getDisplayText(
                    object, property, defaultValue, translatable, short
                );
                if (result) {
                    displayValue = result;
                    break;
                }
            }
        }

        if (Object.prototype.hasOwnProperty.call(object, 'getDisplayValue')) {
            displayValue = object.getDisplayValue(property);
        }

        if (displayValue) {
            return displayValue;
        }

        // check local cache
        const cachedValueMap = this.getCachedValueMap<string>(
            object.KIXObjectType, property
        );

        const objectValue = object[property];
        // handle complex value for "cache"
        let valueString: string = (Array.isArray(objectValue) || typeof objectValue === 'object') ?
            JSON.stringify(objectValue) : objectValue;
        if (!valueString && typeof defaultValue !== 'undefined') {
            valueString = (Array.isArray(defaultValue) || typeof defaultValue === 'object') ?
                JSON.stringify(defaultValue) : defaultValue;
        }
        valueString += translatable ? '-1' : '-0';
        valueString += short ? '-1' : '-0';

        // if we have already a display value for this property then return directly
        // FIXME: check against ObjectProperty or something similar if property is supported (KIX2018-6164)?
        if (typeof objectValue !== 'undefined' && cachedValueMap?.has(valueString)) {
            return cachedValueMap.get(valueString);
        }

        const key = `${object.KIXObjectType}-${property}-${valueString}`;
        // FIXME: check against ObjectProperty or something similar if property is supported (KIX2018-6164)?
        if (typeof objectValue !== 'undefined' && this.requestDisplayValuePromises.has(key)) {
            return this.requestDisplayValuePromises.get(key);
        }

        const requestPromise = this.createRequestDisplayValuePromise(
            object, property, key, valueString, defaultValue, translatable, short
        );
        this.requestDisplayValuePromises.set(key, requestPromise);
        return requestPromise;
    }

    private getCachedValueMap<T>(
        kixObjectType: KIXObjectType | string, property: string,
        cache: Map<KIXObjectType | string, Map<string, Map<any, any>>> = this.displayValueCache
    ): Map<any, T> {
        if (!cache.has(kixObjectType)) {
            cache.set(kixObjectType, new Map());
        }

        const propertiesMap = cache.get(kixObjectType);
        if (!propertiesMap.has(property)) {
            propertiesMap.set(property, new Map());
        }
        return propertiesMap.get(property);
    }

    private createRequestDisplayValuePromise<T extends KIXObject>(
        object: T, property: string, key: string, valueString: string, defaultValue?: string,
        translatable: boolean = true, short?: boolean
    ): Promise<string> {
        return new Promise(async (resolve, reject) => {
            let displayValue;
            let labelProvider = this.getLabelProviderForProperty(object, property);

            if (!labelProvider) {
                labelProvider = this.getLabelProvider(object);
            }

            if (!displayValue) {
                displayValue = await labelProvider?.getDisplayText(object, property, defaultValue, translatable, short);
            }

            const cachedValueMap = this.getCachedValueMap<string>(object.KIXObjectType, property);
            cachedValueMap?.set(valueString, displayValue);

            this.requestDisplayValuePromises.delete(key);
            resolve(displayValue);
        });
    }

    public async getIcons<T extends KIXObject>(
        object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>> {
        let displayIcons;

        if (Object.prototype.hasOwnProperty.call(object, 'getDisplayIcons')) {
            displayIcons = object.getDisplayIcons(property);
        }

        if (displayIcons) {
            return displayIcons;
        }

        const cachedValueMap = this.getCachedValueMap<Array<ObjectIcon | string>>(
            object.KIXObjectType, property, this.displayIconCache
        );

        const objectValue = object[property];
        // handle complex value for "cache"
        let valueString: string | number = (Array.isArray(objectValue) || typeof objectValue === 'object') ?
            JSON.stringify(objectValue) : objectValue;
        if (!valueString && typeof value !== 'undefined') {
            valueString = (Array.isArray(value) || typeof value === 'object') ?
                JSON.stringify(value) : value;
        }
        valueString += forTable ? '-1' : '-0';
        // if we have already a display value for this property then return directly
        // FIXME: check against ObjectProperty or something similar if property is supported (KIX2018-6164)?
        if (typeof objectValue !== 'undefined' && cachedValueMap?.has(valueString)) {
            return cachedValueMap.get(valueString);
        }

        const key = `${object.KIXObjectType}-${property}-${valueString}`;
        // FIXME: check against ObjectProperty or something similar if property is supported (KIX2018-6164)?
        if (typeof objectValue !== 'undefined' && this.requestIconPromises.has(key)) {
            return this.requestIconPromises.get(key);
        }

        const requestPromise = this.createRequestIconPromise(object, property, key, valueString, value, forTable);
        this.requestIconPromises.set(key, requestPromise);
        return requestPromise;
    }

    private createRequestIconPromise(
        object: KIXObject, property: string, key: string, valueString: string | number, value?: string | number,
        forTable?: boolean
    ): Promise<Array<ObjectIcon | string>> {
        return new Promise(async (resolve, reject) => {
            let displayIcons;

            const labelProvider = this.getLabelProvider(object);

            if (labelProvider) {
                for (const extendedLabelProvider of (labelProvider as LabelProvider)?.getExtendedLabelProvider()) {
                    const result = await extendedLabelProvider.getIcons(object, property, value, forTable);
                    if (result) {
                        displayIcons = result;
                        break;
                    }
                }

                if (!displayIcons) {
                    displayIcons = await labelProvider.getIcons(object, property, value, forTable);
                }

                const cachedValueMap = this.getCachedValueMap<Array<ObjectIcon | string>>(
                    object.KIXObjectType, property, this.displayIconCache
                );

                cachedValueMap?.set(valueString, displayIcons);
            }
            this.requestIconPromises.delete(key);
            resolve(displayIcons);
        });
    }

    public async getDFDisplayValues(
        objectType: KIXObjectType | string, fieldValue: DynamicFieldValue, short?: boolean
    ): Promise<[string[], string, string[]]> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getDFDisplayValues(fieldValue, short);
                if (result) {
                    return result;
                }
            }

            return labelProvider.getDFDisplayValues(fieldValue, short);
        }
        return null;
    }

    public getObjectIcon<T extends KIXObject>(object: T): string | ObjectIcon {
        const labelProvider = object ? this.getLabelProvider(object) : null;

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = extendedLabelProvider.getObjectIcon(object);
                if (result) {
                    return result;
                }
            }

            return labelProvider.getObjectIcon(object);
        }
        return null;
    }

    public getObjectIconForType(objectType: KIXObjectType | string): string | ObjectIcon {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = extendedLabelProvider.getObjectIcon();
                if (result) {
                    return result;
                }
            }

            return labelProvider.getObjectIcon();
        }
        return null;
    }

    public getObjectTypeIcon(objectType: KIXObjectType | string): string | ObjectIcon {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = extendedLabelProvider.getObjectTypeIcon();
                if (result) {
                    return result;
                }
            }

            return labelProvider.getObjectTypeIcon();
        }
        return null;
    }

    public async getObjectText<T extends KIXObject>(
        object: T, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProvider(object);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getObjectText(object, id, title, translatable);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getObjectText(object, id, title, translatable);
        }
        return null;
    }

    public getAdditionalText<T extends KIXObject>(object: T, translatable: boolean = true): string {
        const labelProvider = this.getLabelProvider(object);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = extendedLabelProvider.getObjectAdditionalText(object, translatable);
                if (result) {
                    return result;
                }
            }

            return labelProvider.getObjectAdditionalText(object, translatable);
        }
        return null;
    }

    public async getObjectName(
        objectType: KIXObjectType | string, plural: boolean = false, translatable?: boolean
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getObjectName(plural, translatable);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getObjectName(plural, translatable);
        }
        return objectType;
    }

    public async getTooltip<T extends KIXObject>(object: T, translatable: boolean = true): Promise<string> {
        const labelProvider = this.getLabelProvider(object);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getObjectTooltip(object, translatable);
                if (result) {
                    return result;
                }
            }

            return labelProvider.getObjectTooltip(object, translatable);
        }
        return null;
    }

    public async getPropertyText(
        property: string, objectType: KIXObjectType | string, short: boolean = false, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getPropertyText(property, short, translatable);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getPropertyText(property, short, translatable);
        }
        return null;
    }

    public async getExportPropertyText(
        property: string, objectType: KIXObjectType | string, useDisplayText?: boolean
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getExportPropertyText(property, useDisplayText);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getExportPropertyText(property, useDisplayText);
        }
        return null;
    }

    public async getExportPropertyValue(
        property: string, objectType: KIXObjectType | string, value: any, object?: any
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getExportPropertyValue(property, value, object);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getExportPropertyValue(property, value, object);
        }
        return null;
    }

    public async getPropertyIcon(property: string, objectType: KIXObjectType | string): Promise<string | ObjectIcon> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getPropertyIcon(property);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getPropertyIcon(property);
        }
        return null;
    }

    public async getPropertyValueDisplayText(
        objectType: KIXObjectType | string, property: string, value: string | number, translatable?: boolean,
        object?: KIXObject
    ): Promise<string> {
        if (!object) {
            object ||= { KIXObjectType: objectType } as KIXObject;
            object[property] = value;
        }
        return this.getDisplayText(object as any, property, value?.toString(), translatable);
    }

    public async getIconsForType<T extends KIXObject>(
        objectType: KIXObjectType | string, object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getIcons(object, property, value, forTable);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getIcons(object, property, value, forTable);
        }
        return [];
    }

    public getDisplayTextClasses<T extends KIXObject>(object: T, property: string): string[] {
        const labelProvider = this.getLabelProvider(object);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = extendedLabelProvider.getDisplayTextClasses(object, property);
                if (result) {
                    return result;
                }
            }

            return labelProvider.getDisplayTextClasses(object, property);
        }
        return [];
    }

    public async createLabelsFromDFValue(
        objectType: KIXObjectType | string, fieldValue: DynamicFieldValue
    ): Promise<Label[]> {
        const labelProvider = await this.getLabelProviderForDFValue(fieldValue);

        if (labelProvider) {
            for (const extendedLabelProvider of (labelProvider as LabelProvider).getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.createLabelsFromDFValue(fieldValue);
                if (result) {
                    return result;
                }
            }

            return labelProvider.createLabelsFromDFValue(fieldValue);
        }
        return null;
    }

    private async getLabelProviderForDFValue<T extends KIXObject>(
        fieldValue: DynamicFieldValue
    ): Promise<LabelProvider<T>> {
        const dynamicField = fieldValue && fieldValue.ID ? await KIXObjectService.loadDynamicField(
            fieldValue.Name ? fieldValue.Name : null,
            fieldValue.ID ? Number(fieldValue.ID) : null
        ) : null;
        if (dynamicField) {
            let labelProvider = this.objectLabelProvider.find((lp) =>
                lp.isLabelProviderForDFType(dynamicField.FieldType));
            if (!labelProvider) {
                labelProvider = this.objectLabelProvider.find((lp) =>
                    lp.isLabelProviderForDFType(KIXObjectType.DYNAMIC_FIELD));
            }
            return (labelProvider as LabelProvider);
        }
        return;
    }


}
