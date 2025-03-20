/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectTag } from '../../model/ObjectTag';
import { ObjectTagProperty } from '../../model/ObjectTagProperty';

export class ObjectTagLabelProvider extends LabelProvider<ObjectTag> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.OBJECT_TAG;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof ObjectTag || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ObjectTagProperty.NAME:
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

        return displayValue;
    }

    public async getDisplayText(
        objectTag: ObjectTag, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = objectTag[property];

        switch (property) {
            case ObjectTagProperty.NAME:
                translatable = false;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectText(
        objectTag: ObjectTag, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return objectTag.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Object Tags' : 'Translatable#Object Tag'
            );
        }
        return plural ? 'ObjectTags' : 'ObjectTag';
    }

    public async getObjectTooltip(objectTag: ObjectTag, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(objectTag.Name);
        }
        return objectTag.Name;
    }

}
