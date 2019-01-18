import { ILabelProvider } from "../ILabelProvider";
import {
    TextModule, KIXObjectType, ObjectIcon, TextModuleProperty
} from "../../model";
import { SearchProperty } from "../SearchProperty";

export class TextModuleLabelProvider implements ILabelProvider<TextModule> {

    public kixObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public isLabelProviderFor(textModule: TextModule): boolean {
        return textModule instanceof TextModule;
    }

    public async getPropertyText(property: string, textModule?: TextModule, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case TextModuleProperty.NAME:
                displayValue = 'Name';
                break;
            case TextModuleProperty.LANGUAGE:
                displayValue = 'Sprache';
                break;
            case TextModuleProperty.CATEGORY:
                displayValue = 'Kategorie';
                break;
            case TextModuleProperty.KEYWORDS:
                displayValue = 'Schlagworte';
                break;
            case TextModuleProperty.COMMENT:
                displayValue = 'Kommentar';
                break;
            case TextModuleProperty.CREATED_BY:
                displayValue = 'Erstellt von';
                break;
            case TextModuleProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case TextModuleProperty.CHANGE_BY:
                displayValue = 'Geändert von';
                break;
            case TextModuleProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
                break;
            case TextModuleProperty.VALID_ID:
                displayValue = 'Gültigkeit';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public getDisplayText(textModule: TextModule, property: string): Promise<string> {
        return textModule[property];
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(textModule: TextModule, property: string): string[] {
        return [];
    }

    public getObjectClasses(textModule: TextModule): string[] {
        return [];
    }

    public async getObjectText(textModule: TextModule, id?: boolean, title?: boolean): Promise<string> {
        return 'Typ: ' + textModule.Name;
    }

    public getObjectAdditionalText(textModule: TextModule): string {
        return null;
    }

    public getObjectIcon(textModule?: TextModule): string | ObjectIcon {
        return null;
    }

    public getObjectName(plural?: boolean): string {
        return plural ? 'Textbausteine' : 'Textbaustein';
    }

    public getObjectTooltip(textModule: TextModule): string {
        return textModule.Name;
    }

    public async getIcons(
        textModule: TextModule, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}
