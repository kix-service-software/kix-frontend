/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ObjectIcon, KIXObjectType, MailAccount, MailAccountProperty, User, DateTimeUtil,
    KIXObjectProperty, DispatchingType, Queue, ValidObject
} from '../../model';
import { TranslationService } from '../i18n/TranslationService';
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

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
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
            case MailAccountProperty.ID:
                displayValue = 'Translatable#Id';
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
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;

        switch (property) {
            case MailAccountProperty.TRUSTED:
                displayValue = Boolean(value) ? 'Translatable#Yes' : 'Translatable#No';
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
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

