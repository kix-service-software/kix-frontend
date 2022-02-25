/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { Contact } from '../../model/Contact';
import { Organisation } from '../../model/Organisation';
import { EditContactDialogContext } from './context/EditContactDialogContext';
import { NewContactDialogContext } from './context/NewContactDialogContext';

export class ContactDialogUtil {

    public static async create(): Promise<void> {
        const additionalInformation: Array<[string, any]> = [];
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const organisation = await context.getObject<Organisation>(KIXObjectType.ORGANISATION);
            if (organisation) {
                additionalInformation.push([KIXObjectType.ORGANISATION, organisation]);
            }
        }

        ContextService.getInstance().setActiveContext(
            NewContactDialogContext.CONTEXT_ID, undefined, undefined, additionalInformation
        );
    }

    public static async edit(contactId?: string | number): Promise<void> {
        if (!contactId) {
            const context = ContextService.getInstance().getActiveContext();
            contactId = context?.getObjectId();
        }

        const additionalInformation: Array<[string, any]> = [
            ['CONTACT_ID', contactId]
        ];
        ContextService.getInstance().setActiveContext(
            EditContactDialogContext.CONTEXT_ID, contactId, null, additionalInformation
        );
    }

    public static async duplicate(contact: Contact): Promise<void> {
        ContextService.getInstance().setActiveContext(NewContactDialogContext.CONTEXT_ID, contact?.ID);
    }

}
