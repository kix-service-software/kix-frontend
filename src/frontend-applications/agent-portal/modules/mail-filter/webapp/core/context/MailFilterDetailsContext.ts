/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { MailFilter } from '../../../model/MailFilter';
import { BreadcrumbInformation } from '../../../../../model/BreadcrumbInformation';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

export class MailFilterDetailsContext extends Context {

    public static CONTEXT_ID = 'mail-filter-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<MailFilter>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const categoryLabel = await TranslationService.translate('Translatable#Communication');
        const emailLabel = await TranslationService.translate('Translatable#Email');
        const mailFilter = await this.getObject<MailFilter>();
        const breadcrumbText = `${categoryLabel}: ${emailLabel}: ${mailFilter.Name}`;
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], breadcrumbText);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.MAIL_FILTER, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadDetailsObject(KIXObjectType.MAIL_FILTER) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, objectType, changedProperties)
            );
        }

        return object;
    }

}
