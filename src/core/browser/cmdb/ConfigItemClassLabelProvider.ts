import { ObjectIcon, KIXObjectType, ConfigItemClass, ConfigItemClassProperty } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

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

    public getObjectIcon(ciClass: ConfigItemClass): string | ObjectIcon {
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

    public async getIcons(
        ciClass: ConfigItemClass, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        let icons = [];
        if (ciClass) {
            switch (property) {
                case ConfigItemClassProperty.ID:
                case 'ICON':
                    icons.push(new ObjectIcon(KIXObjectType.CONFIG_ITEM_CLASS, ciClass.ID));
                    break;
                default:
                    icons = [];
            }
        }
        return icons;
    }
}
