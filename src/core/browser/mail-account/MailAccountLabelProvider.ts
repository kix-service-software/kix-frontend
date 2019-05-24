import { ObjectIcon, KIXObjectType, MailAccount, MailAccountProperty, User, DateTimeUtil } from '../../model';
import { ILabelProvider } from '..';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';
import { KIXObjectService } from "../kix";

export class MailAccountLabelProvider implements ILabelProvider<MailAccount> {

    public kixObjectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case MailAccountProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                case MailAccountProperty.CREATE_BY:
                case MailAccountProperty.CHANGE_BY:
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                    break;
                case MailAccountProperty.CREATE_TIME:
                case MailAccountProperty.CHANGE_TIME:
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

    public isLabelProviderFor(object: MailAccount): boolean {
        return object instanceof MailAccount;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case MailAccountProperty.HOST:
                displayValue = 'Translatable#Hostname';
                break;
            case MailAccountProperty.LOGIN:
                displayValue = 'Translatable#User Name';
                break;
            case MailAccountProperty.PASSWORD:
                displayValue = 'Translatable#Password';
                break;
            case MailAccountProperty.IMAP_FOLDER:
                displayValue = 'Translatable#IMAP Folder';
                break;
            case MailAccountProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case MailAccountProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case MailAccountProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case MailAccountProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case MailAccountProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case MailAccountProperty.ID:
                displayValue = 'Translatable#Id';
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
        mailAccount: MailAccount, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = mailAccount[property];

        switch (property) {
            case MailAccountProperty.ID:
                displayValue = mailAccount.Host;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: MailAccount, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: MailAccount): string[] {
        return [];
    }

    public async getObjectText(
        mailAccount: MailAccount, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${mailAccount.Host}`;
    }

    public getObjectAdditionalText(object: MailAccount, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: MailAccount): string | ObjectIcon {
        return new ObjectIcon('MailAccount', object.ID);
    }

    public getObjectTooltip(object: MailAccount): string {
        return '';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Email Accounts' : 'Translatable#Email Account'
            );
        }
        return plural ? 'Email Accounts' : 'Email Account';
    }


    public async getIcons(object: MailAccount, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

