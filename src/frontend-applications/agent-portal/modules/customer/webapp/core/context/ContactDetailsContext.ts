/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { Contact } from '../../../model/Contact';
import { BreadcrumbInformation } from '../../../../../model/BreadcrumbInformation';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ContactProperty } from '../../../model/ContactProperty';
import { OrganisationContext } from './OrganisationContext';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

export class ContactDetailsContext extends Context {

    public static CONTEXT_ID: string = 'contact-details';

    public getIcon(): string {
        return 'kix-icon-man-bubble';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return LabelService.getInstance().getObjectText(await this.getObject<Contact>(), short, short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Contact>();
        const text = await LabelService.getInstance().getObjectText(object);
        return new BreadcrumbInformation('kix-icon-organisation', [OrganisationContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONTACT, reload: boolean = false
    ): Promise<O> {
        let object;

        if (objectType === KIXObjectType.CONTACT) {
            object = await this.loadContact() as any;

            if (reload) {
                this.listeners.forEach((l) => l.objectChanged(this.getObjectId(), object, KIXObjectType.CONTACT));
            }
        }

        return object;
    }

    private async loadContact(): Promise<Contact> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [KIXObjectProperty.DYNAMIC_FIELDS, ContactProperty.USER]
        );

        return await this.loadDetailsObject<Contact>(KIXObjectType.CONTACT, loadingOptions);
    }

}
