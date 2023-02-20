/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { Label } from './Label';

export interface ILabelProvider<T = any> {

    kixObjectType: KIXObjectType | string;

    getSupportedProperties(): string[];

    isLabelProviderFor(object: T): boolean;

    isLabelProviderForType(objectType: KIXObjectType | string): boolean;

    isLabelProviderForDFType(dfFieldType: string): boolean;

    getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string>;

    getObjectName(plural?: boolean, translatable?: boolean): Promise<string>;

    getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string>;

    getExportPropertyText(property: string, useDisplayText?: boolean): Promise<string>;

    getExportPropertyValue(property: string, value: any, object?: any): Promise<any>;

    getDisplayText(
        object: T, property: string, defaultValue?: string, translatable?: boolean, short?: boolean
    ): Promise<string>;

    getObjectAdditionalText(object: T, translatable?: boolean): string;

    getPropertyValueDisplayText(property: string, value: string | number, translatable?: boolean): Promise<string>;

    getObjectTooltip(object: T, translatable?: boolean): Promise<string>;

    getPropertyIcon(property: string): Promise<string | ObjectIcon>;

    getDisplayTextClasses(object: T, property: string): string[];

    getObjectClasses(object: T): string[];

    getObjectIcon(object?: T): string | ObjectIcon;

    getObjectTypeIcon(): string | ObjectIcon;

    getIcons(
        object: T, property: string, value?: string | number, forTable?: boolean
    ): Promise<Array<string | ObjectIcon>>;

    canShow(property: string, object: T): boolean;

    getDFDisplayValues(fieldValue: DynamicFieldValue, short?: boolean): Promise<[string[], string, string[]]>;

    createLabelsFromDFValue(fieldValue: DynamicFieldValue): Promise<Label[]>;

}
