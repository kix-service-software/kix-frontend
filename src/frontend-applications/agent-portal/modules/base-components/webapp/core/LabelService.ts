/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from "./ILabelProvider";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";

export class LabelService {

    private static INSTANCE: LabelService;

    public static getInstance(): LabelService {
        if (!LabelService.INSTANCE) {
            LabelService.INSTANCE = new LabelService();
        }
        return LabelService.INSTANCE;
    }

    private constructor() { }

    private labelProviders: Array<ILabelProvider<any>> = [];

    public registerLabelProvider<T>(labelProvider: ILabelProvider<T>): void {
        this.labelProviders.push(labelProvider);
    }

    public getObjectIcon<T extends KIXObject>(object: T): string | ObjectIcon {
        const labelProvider = object ? this.getLabelProvider(object) : null;
        if (labelProvider) {
            return labelProvider.getObjectIcon(object);
        }
        return null;
    }

    public getObjectTypeIcon<T extends KIXObject>(objectType?: KIXObjectType | string): string | ObjectIcon {
        const labelProvider = objectType ? this.getLabelProviderForType(objectType) : null;
        if (labelProvider) {
            return labelProvider.getObjectTypeIcon();
        }
        return null;
    }

    public async getText<T extends KIXObject>(
        object: T, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return await labelProvider.getObjectText(object, id, title, translatable);
        }
        return null;
    }

    public getAdditionalText<T extends KIXObject>(object: T, translatable: boolean = true): string {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return labelProvider.getObjectAdditionalText(object, translatable);
        }
        return null;
    }

    public async getObjectName(
        objectType: KIXObjectType | string, plural: boolean = false, translatable?: boolean
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getObjectName(plural, translatable);
        }
        return objectType;
    }

    public async getTooltip<T extends KIXObject>(object: T, translatable: boolean = true): Promise<string> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return labelProvider.getObjectTooltip(object, translatable);
        }
        return null;
    }

    public async getPropertyText(
        property: string, objectType: KIXObjectType | string, short: boolean = false, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getPropertyText(property, short, translatable);
        }
        return null;
    }

    public async getExportPropertyText(
        property: string, objectType: KIXObjectType | string, useDisplayText?: boolean
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getExportPropertyText(property, useDisplayText);
        }
        return null;
    }

    public async getExportPropertyValue(
        property: string, objectType: KIXObjectType | string, value: any
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getExportPropertyValue(property, value);
        }
        return null;
    }

    public async getPropertyIcon(property: string, objectType: KIXObjectType | string): Promise<string | ObjectIcon> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getPropertyIcon(property);
        }
        return null;
    }

    public async getPropertyValueDisplayText<T extends KIXObject>(
        object: T, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return await labelProvider.getDisplayText(object, property, defaultValue, translatable);
        }
        return null;
    }

    public async getPropertyValueDisplayIcons<T extends KIXObject>(
        object: T, property: string, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return await labelProvider.getIcons(object, property, null, forTable);
        }
        return null;
    }

    public getLabelProvider<T extends KIXObject>(object: T): ILabelProvider<T> {
        return this.labelProviders.find((lp) => lp.isLabelProviderFor(object));
    }

    public getLabelProviderForType<T extends KIXObject>(objectType: KIXObjectType | string): ILabelProvider<T> {
        return this.labelProviders.find((lp) => lp.isLabelProviderForType(objectType));
    }

}
