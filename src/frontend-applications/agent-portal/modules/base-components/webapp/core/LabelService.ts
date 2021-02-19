/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelProvider } from './LabelProvider';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { Label } from './Label';
import { KIXObjectService } from './KIXObjectService';

export class LabelService {

    private static INSTANCE: LabelService;

    public static getInstance(): LabelService {
        if (!LabelService.INSTANCE) {
            LabelService.INSTANCE = new LabelService();
        }
        return LabelService.INSTANCE;
    }

    private constructor() { }

    private labelProviders: Array<LabelProvider<any>> = [];

    public registerLabelProvider<T>(labelProvider: LabelProvider<T>): void {
        if (!this.labelProviders.some((lp) => lp.isLabelProviderForType(labelProvider.kixObjectType))) {
            this.labelProviders.push(labelProvider);
        }
    }

    public getLabelProvider<T extends KIXObject>(object: T): LabelProvider<T> {
        return this.labelProviders.find((lp) => lp.isLabelProviderFor(object));
    }

    public getLabelProviderForType<T extends KIXObject>(objectType: KIXObjectType | string): LabelProvider<T> {
        return this.labelProviders.find((lp) => lp.isLabelProviderForType(objectType));
    }

    public async getDFDisplayValues(
        objectType: KIXObjectType | string, fieldValue: DynamicFieldValue
    ): Promise<[string[], string, string[]]> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getDFDisplayValues(fieldValue);
                if (result) {
                    return result;
                }
            }

            return labelProvider.getDFDisplayValues(fieldValue);
        }
        return null;
    }

    public getObjectIcon<T extends KIXObject>(object: T): string | ObjectIcon {
        const labelProvider = object ? this.getLabelProvider(object) : null;

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
        property: string, objectType: KIXObjectType | string, value: any
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getExportPropertyValue(property, value);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getExportPropertyValue(property, value);
        }
        return null;
    }

    public async getPropertyIcon(property: string, objectType: KIXObjectType | string): Promise<string | ObjectIcon> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getPropertyIcon(property);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getPropertyIcon(property);
        }
        return null;
    }

    public async getDisplayText<T extends KIXObject>(
        object: T, property: string, defaultValue?: string, translatable: boolean = true, short?: boolean
    ): Promise<string> {
        const labelProvider = this.getLabelProvider(object);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getDisplayText(object, property, defaultValue, translatable);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getDisplayText(object, property, defaultValue, translatable);
        }
        return null;
    }

    public async getPropertyValueDisplayText(
        objectType: KIXObjectType | string, property: string, value: string | number, translatable?: boolean
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getPropertyValueDisplayText(
                    property, value, translatable
                );
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getPropertyValueDisplayText(property, value, translatable);
        }
        return null;
    }

    public async getIcons<T extends KIXObject>(
        object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>> {
        const labelProvider = this.getLabelProvider(object);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = await extendedLabelProvider.getIcons(object, property, value, forTable);
                if (result) {
                    return result;
                }
            }

            return await labelProvider.getIcons(object, property, value, forTable);
        }
        return [];
    }

    public async getIconsForType<T extends KIXObject>(
        objectType: KIXObjectType | string, object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>> {
        const labelProvider = this.getLabelProviderForType(objectType);

        if (labelProvider) {
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
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
            for (const extendedLabelProvider of labelProvider.getExtendedLabelProvider()) {
                const result = extendedLabelProvider.createLabelsFromDFValue(fieldValue);
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
            return this.labelProviders.find((lp) => lp.isLabelProviderForDFType(dynamicField.FieldType));
        }
        return;
    }


}
