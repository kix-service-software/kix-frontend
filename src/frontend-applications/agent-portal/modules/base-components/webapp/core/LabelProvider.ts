/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from "./ILabelProvider";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { TranslationService } from "../../../translation/webapp/core";
import { KIXObjectService } from "./KIXObjectService";
import { ValidObject } from "../../../valid/model/ValidObject";
import { User } from "../../../user/model/User";
import { DateTimeUtil } from "./DateTimeUtil";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";

export class LabelProvider<T = any> implements ILabelProvider<T> {

    public kixObjectType: KIXObjectType | string;

    public isLabelProviderFor(object: T): boolean {
        throw new Error("Method not implemented.");
    }

    public isLabelProviderForType(objectType: KIXObjectType | string): boolean {
        return objectType === this.kixObjectType;
    }

    public async getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return object.toString();
    }

    public async getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        return '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case KIXObjectProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            case 'LinkedAs':
                displayValue = 'Translatable#Linked as';
                break;
            default:
                displayValue = property;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getExportPropertyText(property: string, useDisplayText?: boolean): Promise<string> {
        if (!useDisplayText) {
            switch (property) {
                case KIXObjectProperty.VALID_ID:
                    return 'Validity';
                default:
                    return property;
            }
        }
        return this.getPropertyText(property);
    }

    public async getExportPropertyValue(property: string, value: any): Promise<any> {
        let newValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    newValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
            default:
        }
        return newValue;
    }

    public async getDisplayText(
        object: T, property: string, defaultValue?: string, translatable?: boolean
    ): Promise<string> {
        return await this.getPropertyValueDisplayText(property, object[property], translatable);
    }

    public getObjectAdditionalText(object: T, translatable?: boolean): string {
        return '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    displayValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
                break;
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                }
                break;
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getObjectTooltip(object: T, translatable?: boolean): string {
        return '';
    }

    public getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return null;
    }

    public getDisplayTextClasses(object: T, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: T): string[] {
        return [];
    }

    public getObjectIcon(object?: T): string | ObjectIcon {
        return this.getObjectTypeIcon();
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return null;
    }

    public async getIcons(object: T, property: string, value?: string | number): Promise<Array<(string | ObjectIcon)>> {
        return [];
    }

    public canShow(property: string, object: T): boolean {
        return true;
    }

}
