/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from "../../../../modules/base-components/webapp/core/LabelProvider";
import { ConfigItemClass } from "../../model/ConfigItemClass";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ConfigItemClassProperty } from "../../model/ConfigItemClassProperty";
import { TranslationService } from "../../../../modules/translation/webapp/core/TranslationService";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";


export class ConfigItemClassLabelProvider extends LabelProvider<ConfigItemClass> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemClassProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case ConfigItemClassProperty.ID:
                displayValue = 'Translatable#Icon';
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
        ciClass: ConfigItemClass, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ciClass[property];

        switch (property) {
            case ConfigItemClassProperty.ID:
            case 'ICON':
                displayValue = ciClass.Name;
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

    public isLabelProviderFor(ciClass: ConfigItemClass): boolean {
        return ciClass instanceof ConfigItemClass;
    }

    public async getObjectText(
        ciClass: ConfigItemClass, id: boolean = true, name: boolean = true, translatable?: boolean
    ): Promise<string> {
        return ciClass.Name;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(ciClass: ConfigItemClass): string {
        return ciClass.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#CI Classes' : 'Translatable#CI Class'
            );
        }
        return plural ? 'CI Classes' : 'CI Class';
    }


    public getObjectIcon(ciClass?: ConfigItemClass): string | ObjectIcon {
        return new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, ciClass.ID);
    }

    public async getIcons(
        ciClass: ConfigItemClass, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        let icons = [];
        if (ciClass) {
            switch (property) {
                case ConfigItemClassProperty.ID:
                case 'ICON':
                    icons.push(this.getObjectIcon(ciClass));
                    break;
                default:
                    icons = [];
            }
        }
        return icons;
    }
}