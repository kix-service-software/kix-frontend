import { ILabelProvider } from "../ILabelProvider";
import {
    TextModule, KIXObjectType, ObjectIcon, TextModuleProperty, KIXObjectProperty, User, DateTimeUtil
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
import { KIXObjectService } from "../kix";

export class TextModuleLabelProvider implements ILabelProvider<TextModule> {

    public kixObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(textModule: TextModule): boolean {
        return textModule instanceof TextModule;
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
            case TextModuleProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case KIXObjectProperty.VALID_ID:
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
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case KIXObjectProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                case KIXObjectProperty.CREATE_BY:
                case KIXObjectProperty.CHANGE_BY:
                    if (value) {
                        const users = await KIXObjectService.loadObjects<User>(
                            KIXObjectType.USER, [value], null, null, true
                        ).catch((error) => [] as User[]);
                        displayValue = users && !!users.length ? users[0].UserFullname : value;
                    }
                    break;
                case KIXObjectProperty.CREATE_TIME:
                case KIXObjectProperty.CHANGE_TIME:
                    displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                    break;
                default:
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(textModule: TextModule, property: string): string[] {
        return [];
    }

    public getObjectClasses(textModule: TextModule): string[] {
        return [];
    }

    public async getObjectText(
        textModule: TextModule, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${textModule.Name}`;
    }

    public getObjectAdditionalText(object: TextModule, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(textModule?: TextModule): string | ObjectIcon {
        return null;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Text Modules' : 'Translatable#Text Module'
            );
        }
        return plural ? 'Text Modules' : 'Text Module';
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
