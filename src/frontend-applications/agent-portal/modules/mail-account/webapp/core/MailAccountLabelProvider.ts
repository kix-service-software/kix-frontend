/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { MailAccount } from '../../model/MailAccount';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { MailAccountProperty } from '../../model/MailAccountProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { DispatchingType } from '../../model/DispatchingType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class MailAccountLabelProvider extends LabelProvider<MailAccount> {

    public kixObjectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof MailAccount || object?.KIXObjectType === this.kixObjectType;
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
            case MailAccountProperty.OAUTH2_PROFILEID:
                displayValue = 'Translatable#OAuth2 Profile';
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
                    const queues = await KIXObjectService.loadObjects(
                        KIXObjectType.QUEUE, [mailAccount.QueueID], null, null, true
                    ).catch((error) => []);
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
                displayValue = value ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case MailAccountProperty.OAUTH2_PROFILEID:
                if (value) {
                    const profiles = await KIXObjectService.loadObjects(
                        KIXObjectType.OAUTH2_PROFILE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = profiles && !!profiles.length ? profiles[0].Name : value;
                }
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
        return new ObjectIcon(null, 'MailAccount', object.ID);
    }

    public async getObjectTooltip(object: MailAccount, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(object.Host);
        }
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

