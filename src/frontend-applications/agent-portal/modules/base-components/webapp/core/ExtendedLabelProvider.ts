/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { ILabelProvider } from './ILabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { Label } from './Label';

export abstract class ExtendedLabelProvider<T extends KIXObject = KIXObject> implements ILabelProvider<T> {

    public kixObjectType: string = KIXObjectType.TICKET;

    public getSupportedProperties(): string[] {
        return [];
    }

    public isLabelProviderFor(object: T): boolean {
        return null;
    }

    public isLabelProviderForType(objectType: string): boolean {
        return null;
    }

    public isLabelProviderForDFType(dfFieldType: string): boolean {
        return null;
    }

    public getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return null;
    }

    public getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        return null;
    }

    public getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        return null;
    }

    public getExportPropertyText(property: string, useDisplayText?: boolean): Promise<string> {
        return null;
    }

    public getExportPropertyValue(property: string, value: any, object?: T): Promise<any> {
        return null;
    }

    public getDisplayText(
        object: T, property: string, defaultValue?: string, translatable?: boolean, short?: boolean
    ): Promise<string> {
        return null;
    }

    public getObjectAdditionalText(object: T, translatable?: boolean): string {
        return null;
    }

    public getPropertyValueDisplayText(
        property: string, value: string | number, translatable?: boolean
    ): Promise<string> {
        return null;
    }

    public getObjectTooltip(object: T, translatable?: boolean): Promise<string> {
        return null;
    }

    public getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return null;
    }

    public getDisplayTextClasses(object: T, property: string): string[] {
        return null;
    }

    public getObjectClasses(object: T): string[] {
        return null;
    }

    public getObjectIcon(object?: T): string | ObjectIcon {
        return null;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return null;
    }

    public getIcons(
        object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>> {
        return null;
    }

    public canShow(property: string, object: T): boolean {
        return null;
    }

    public getDFDisplayValues(fieldValue: DynamicFieldValue, short?: boolean): Promise<[string[], string, string[]]> {
        return null;
    }

    public createLabelsFromDFValue(fieldValue: DynamicFieldValue): Promise<Label[]> {
        return null;
    }

}
