/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ContactProperty } from '../../../model/ContactProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';

export class NewContactDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-contact-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONTACT, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [
                    ContactProperty.USER
                ]
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

    public async destroy(): Promise<void> {
        await super.destroy();

        if (this.getAdditionalInformation('PROVIDE_CONTACT_ID_TO_SOURCE_CONTEXT')) {
            const sourceContext = this.getAdditionalInformation(AdditionalContextInformation.SOURCE_CONTEXT);
            const context = ContextService.getInstance().getContextInstances().find(
                (c) => c.instanceId === sourceContext?.instanceId
            );

            const contactId = this.getAdditionalInformation('NEW_CONTACT_ID');

            const formInstance = await context?.getFormManager()?.getFormInstance();
            formInstance?.provideFormFieldValuesForProperties(
                [[TicketProperty.CONTACT_ID, contactId]], undefined, undefined, false
            );
        }
    }

}
