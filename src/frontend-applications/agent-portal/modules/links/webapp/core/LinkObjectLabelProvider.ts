/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { LinkObject } from '../../model/LinkObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LinkObjectProperty } from '../../model/LinkObjectProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';


export class LinkObjectLabelProvider extends LabelProvider<LinkObject> {

    public kixObjectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue;

        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                displayValue = await LabelService.getInstance().getObjectName(value as KIXObjectType);
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

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
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
            case LinkObjectProperty.LINKED_AS: // != KIXObjectProperty.LINKED_AS (l != L)
                displayValue = 'Translatable#Linked as';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
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

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof LinkObject || object.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(linkObject: LinkObject): Promise<string> {
        return linkObject.title;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-link';
    }

    public async getObjectTooltip(linkObject: LinkObject, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(linkObject.title);
        }
        return linkObject.title;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Linked Objects' : 'Linked Object';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }

        return displayValue;
    }

    public async getIcons(object: LinkObject, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (object && property === LinkObjectProperty.LINKED_OBJECT_TYPE) {
            const icon = LabelService.getInstance().getObjectIcon(object);
            if (icon) {
                icons.push(icon);
            }
        }
        return icons;
    }

}
