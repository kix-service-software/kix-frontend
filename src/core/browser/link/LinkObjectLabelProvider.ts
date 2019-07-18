/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon, KIXObjectType, LinkObject, LinkObjectProperty, KIXObject } from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class LinkObjectLabelProvider extends LabelProvider<LinkObject> {

    public kixObjectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue;

        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                const labelProvider = LabelService.getInstance().getLabelProviderForType(value as KIXObjectType);
                if (labelProvider) {
                    displayValue = await labelProvider.getObjectName(null);
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

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                displayValue = 'Translatable#Object';
                break;
            case LinkObjectProperty.LINKED_OBJECT_DISPLAY_ID:
                displayValue = 'Translatable#Object Id';
                break;
            case LinkObjectProperty.TITLE:
                displayValue = 'Translatable#Label';
                break;
            case LinkObjectProperty.LINKED_AS:
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

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        linkObject: LinkObject, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof linkObject[property] !== 'undefined'
            ? await this.getPropertyValueDisplayText(property, linkObject[property], translatable) : property;

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(linkObject: LinkObject): boolean {
        return linkObject instanceof LinkObject;
    }

    public async getObjectText(linkObject: LinkObject): Promise<string> {
        return linkObject.title;
    }

    public getObjectIcon(linkObject: LinkObject): string | ObjectIcon {
        return 'kix-icon-link';
    }

    public getObjectTooltip(linkObject: LinkObject): string {
        return linkObject.title;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? "Linked Objects" : "Linked Object";
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }

        return displayValue;
    }

    public async getIcons(object: LinkObject, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === LinkObjectProperty.LINKED_OBJECT_TYPE) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(object.linkedObjectType);
            if (labelProvider) {
                const icon = labelProvider.getObjectIcon(object);
                if (icon) {
                    icons.push(icon);
                }
            }
        }
        return icons;
    }

}
