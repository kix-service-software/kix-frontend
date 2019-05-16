import {
    TextModule, KIXObjectType, ObjectIcon, TextModuleProperty
} from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class TextModuleLabelProvider extends LabelProvider<TextModule> {

    public kixObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public isLabelProviderFor(textModule: TextModule): boolean {
        return textModule instanceof TextModule;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case TextModuleProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TextModuleProperty.LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case TextModuleProperty.CATEGORY:
                displayValue = 'Translatable#Category';
                break;
            case TextModuleProperty.KEYWORDS:
                displayValue = 'Translatable#Tags';
                break;
            case TextModuleProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case TextModuleProperty.CREATED_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TextModuleProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TextModuleProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TextModuleProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case TextModuleProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayText(textModule: TextModule, property: string): Promise<string> {
        return textModule[property];
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getObjectText(
        textModule: TextModule, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        const objectName = await this.getObjectName(false, translatable);
        return `${objectName}: ${textModule.Name}`;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Text Modules' : 'Text Module';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return displayValue;
    }

    public getObjectTooltip(textModule: TextModule): string {
        return textModule.Name;
    }

}
