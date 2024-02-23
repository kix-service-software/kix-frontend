/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TextModule } from '../../model/TextModule';
import { TextModuleProperty } from '../../model/TextModuleProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class TextModuleLabelProvider extends LabelProvider<TextModule> {

    public kixObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof TextModule || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TextModuleProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TextModuleProperty.LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case TextModuleProperty.KEYWORDS:
                displayValue = 'Translatable#Tags';
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
        textModule: TextModule, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = textModule[property];

        switch (property) {
            case TextModuleProperty.ID:
                displayValue = textModule.Name;
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
        textModule: TextModule, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${textModule.Name}`;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Text Modules' : 'Translatable#Text Module'
            );
        }
        return plural ? 'Text Modules' : 'Text Module';
    }

    public async getObjectTooltip(textModule: TextModule, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(textModule.Name);
        }
        return textModule.Name;
    }

}
