import {
    ObjectIcon, KIXObjectType, MailAccount, MailAccountProperty, User, DateTimeUtil,
    KIXObjectProperty, DispatchingType, Queue
} from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';
import { KIXObjectService } from "../kix";
import { LabelProvider } from '../LabelProvider';

export class MailAccountLabelProvider extends LabelProvider<MailAccount> {

    public kixObjectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: MailAccount): boolean {
        return object instanceof MailAccount;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case MailAccountProperty.HOST:
                displayValue = 'Translatable#Host';
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
            case MailAccountProperty.TRUSTED:
                displayValue = 'Translatable#Accept KIX Header';
                break;
            case MailAccountProperty.DISPATCHING_BY:
                displayValue = 'Translatable#Dispatching';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
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
            case MailAccountProperty.DISPATCHING_BY:
                if (mailAccount.DispatchingBy === DispatchingType.BACKEND_KEY_DEFAULT) {
                    displayValue = 'Translatable#Default';
                } else if (mailAccount.QueueID) {
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [mailAccount.QueueID], null, null, true
                    ).catch((error) => [] as Queue[]);
                    displayValue = queues && !!queues.length ? queues[0].Name : value;
                }
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
                case KIXObjectProperty.CREATE_TIME:
                case KIXObjectProperty.CHANGE_TIME:
                    displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                    break;
                case MailAccountProperty.TRUSTED:
                    displayValue = Boolean(value) ? 'Translatable#Yes' : 'Translatable#No';
                    break;
                default:
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
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
        return `${mailAccount.Login}@${mailAccount.Host}`;
    }

    public getObjectAdditionalText(object: MailAccount, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: MailAccount): string | ObjectIcon {
        return new ObjectIcon('MailAccount', object.ID);
    }

    public getObjectTooltip(object: MailAccount): string {
        return object.Host;
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

