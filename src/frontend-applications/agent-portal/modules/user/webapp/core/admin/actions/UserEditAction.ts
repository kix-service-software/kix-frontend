/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { Contact } from '../../../../../customer/model/Contact';
import { ContactProperty } from '../../../../../customer/model/ContactProperty';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { EditContactDialogContext } from '../../../../../customer/webapp/core/context/EditContactDialogContext';

export class UserEditAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('contacts', [CRUD.CREATE]),
        new UIComponentPermission('system/users', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const userId = context.getObjectId();
            if (userId) {
                const contactId = await this.getContactId(userId);
                const additionalInformation: Array<[string, any]> = [
                    ['CONTACT_ID', contactId]
                ];
                await ContextService.getInstance().setActiveContext(
                    EditContactDialogContext.CONTEXT_ID, contactId, null, additionalInformation
                );
            }
        }
    }

    private async getContactId(userId: number | string): Promise<number> {
        let contact: Contact;
        if (userId) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null,
                new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            ContactProperty.ASSIGNED_USER_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.AND, userId
                        )
                    ]
                ), null, true
            ).catch(() => [] as Contact[]);
            contact = contacts && contacts.length ? contacts[0] : null;
        }

        return contact?.ID;
    }

}
