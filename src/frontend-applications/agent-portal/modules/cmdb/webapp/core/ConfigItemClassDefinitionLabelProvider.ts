/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { ConfigItemClassDefinition } from '../../model/ConfigItemClassDefinition';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ConfigItemClassDefinitionProperty } from '../../model/ConfigItemClassDefinitionProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';



import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';



export class ConfigItemClassDefinitionLabelProvider extends LabelProvider<ConfigItemClassDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case ConfigItemClassDefinitionProperty.VERSION:
                displayValue = 'Translatable#Version';
                break;
            case ConfigItemClassDefinitionProperty.CURRENT:
                displayValue = 'Translatable#Current Definition';
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
        ciClassDefinition: ConfigItemClassDefinition, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ciClassDefinition[property];

        switch (property) {
            case ConfigItemClassDefinitionProperty.CURRENT:
                displayValue = value ? 'Translatable#(Current definition)' : '';
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

    public isLabelProviderFor(object: ConfigItemClassDefinition | KIXObject): boolean {
        return object instanceof ConfigItemClassDefinition || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(
        ciClassDefinition: ConfigItemClassDefinition, id: boolean = true, name: boolean = true,
        translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate(ciClassDefinition.Class) : ciClassDefinition.Class;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public async getObjectTooltip(
        ciClassDefinition: ConfigItemClassDefinition, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(ciClassDefinition.Class);
        }
        return ciClassDefinition.Class;
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (plural) {
            const definitionsLabel = translatable
                ? await TranslationService.translate('Translatable#CI Class Definitions')
                : 'CI Class Definitions';
            return definitionsLabel;
        }

        const definitionLabel = translatable
            ? await TranslationService.translate('Translatable#CI Class Definition')
            : 'CI Class Definition';
        return definitionLabel;
    }
}
