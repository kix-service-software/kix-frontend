import { ILabelProvider } from "../ILabelProvider";
import { User, KIXObjectType, UserProperty, ObjectIcon } from "../../model";
import { ObjectDataService } from "../ObjectDataService";
import { TranslationService } from "../i18n/TranslationService";


export class UserLabelProvider implements ILabelProvider<User> {

    public kixObjectType: KIXObjectType = KIXObjectType.USER;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case UserProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                default:
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: User): boolean {
        return object instanceof User;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case UserProperty.USER_FIRSTNAME:
                displayValue = 'Translatable#Firstname';
                break;
            case UserProperty.USER_LASTNAME:
                displayValue = 'Translatable#Lastname';
                break;
            case UserProperty.USER_LOGIN:
                displayValue = 'Translatable#Login';
                break;
            case UserProperty.VALID_ID:
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
        object: User, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = object[property];

        switch (property) {
            case UserProperty.VALID_ID:
                const objectData = ObjectDataService.getInstance().getObjectData();
                const valid = objectData.validObjects.find((v) => v.ID.toString() === object[property].toString());
                displayValue = valid ? valid.Name : object[property].toString();
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: User, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: User): string[] {
        return [];
    }

    public async getObjectText(
        object: User, id: boolean = false, name: boolean = false, translatable?: boolean
    ): Promise<string> {
        let returnString = '';
        if (object) {
            returnString = object.UserFullname;
        } else {
            returnString = await this.getObjectName(false, translatable);
        }
        return returnString;
    }

    public getObjectAdditionalText(object: User, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: User): string | ObjectIcon {
        return 'kix-icon-man';
    }

    public getObjectTooltip(object: User, translatable: boolean = true): string {
        return '';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Agents' : 'Translatable#Agent'
            );
        }
        return plural ? 'Agents' : 'Agent';
    }

    public async getIcons(object: User, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}

