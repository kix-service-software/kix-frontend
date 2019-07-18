/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, BreadcrumbInformation, KIXObject, KIXObjectType, MailAccount
} from "../../../model";
import { AdminContext } from "../../admin";
import { EventService } from "../../event";
import { KIXObjectService } from "../../kix";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";
import { TranslationService } from "../../i18n/TranslationService";

export class MailAccountDetailsContext extends Context {

    public static CONTEXT_ID = 'mail-account-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<MailAccount>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const categoryLabel = await TranslationService.translate('Translatable#Communication');
        const emailLabel = await TranslationService.translate('Translatable#Email');
        const mailAccount = await this.getObject<MailAccount>();
        const breadcrumbText = `${categoryLabel}: ${emailLabel}: ${mailAccount.Host}`;
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], breadcrumbText);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadAccount(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, objectType, changedProperties)
            );
        }

        return object;
    }

    private async loadAccount(changedProperties: string[] = [], cache: boolean = true): Promise<MailAccount> {
        const mailAccountId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Email Account ...`
            });
        }, 500);

        const mailAccounts = await KIXObjectService.loadObjects<MailAccount>(
            KIXObjectType.MAIL_ACCOUNT, [mailAccountId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let mailAccount: MailAccount;
        if (mailAccounts && mailAccounts.length) {
            mailAccount = mailAccounts[0];
            this.objectId = mailAccount.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return mailAccount;
    }

}
