/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ObjectIcon, KIXObjectType, ConfigItemClassDefinition, DateTimeUtil,
    ConfigItemClassDefinitionProperty, User
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";

export class ConfigItemClassDefinitionLabelProvider extends LabelProvider<ConfigItemClassDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
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
            case ConfigItemClassDefinitionProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ConfigItemClassDefinitionProperty.CREATE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [displayValue], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
                break;
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

    public isLabelProviderFor(ciClassDefinition: ConfigItemClassDefinition): boolean {
        return ciClassDefinition instanceof ConfigItemClassDefinition;
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

    public getObjectTooltip(ciClassDefinition: ConfigItemClassDefinition): string {
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
