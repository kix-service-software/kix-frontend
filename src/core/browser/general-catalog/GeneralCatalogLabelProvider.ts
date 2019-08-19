/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, GeneralCatalogItem, ContactProperty, KIXObjectProperty } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";
import { GeneralCatalogItemProperty } from "../../model/kix/general-catalog/GeneralCatalogItemProperty";

export class GeneralCatalogLabelProvider extends LabelProvider<GeneralCatalogItem> {

    public kixObjectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;

    public async getPropertyText(
        property: string, short: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let displayValue = property;
        switch (property) {
            case GeneralCatalogItemProperty.CLASS:
                displayValue = 'Translatable#Class';
                break;
            case GeneralCatalogItemProperty.NAME:
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

    public isLabelProviderFor(object: GeneralCatalogItem): boolean {
        return object instanceof GeneralCatalogItem;
    }

    public async getDisplayText(
        generalCatalogItem: GeneralCatalogItem, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = generalCatalogItem[property];

        switch (property) {
            case ContactProperty.VALID:
                displayValue = await this.getPropertyValueDisplayText(
                    KIXObjectProperty.VALID_ID, generalCatalogItem.ValidID, translatable
                );
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

}
