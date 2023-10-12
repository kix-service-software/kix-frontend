/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../../../../../../../server/model/rest/CRUD';
import { IdService } from '../../../../../../../model/IdService';
import { UIComponentPermission } from '../../../../../../../model/UIComponentPermission';
import { AuthenticationSocketClient } from '../../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { NewContactDialogContext } from '../../../../../../customer/webapp/core/context/NewContactDialogContext';
import { FormValueAction } from '../../../../../../object-forms/model/FormValues/FormValueAction';
import { TicketProperty } from '../../../../../model/TicketProperty';

export class CreateContactFormValueAction extends FormValueAction {

    public permissions = [
        new UIComponentPermission('contacts', [CRUD.CREATE])
    ];

    private contextListenerId: string = IdService.generateDateBasedId('CreateContactFormValueAction');

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New';
        this.icon = 'kix-icon-man-bubble-new';
    }

    public async canShow(): Promise<boolean> {
        const contactValue = this.objectValueMapper?.findFormValue(TicketProperty.CONTACT_ID);
        const hasPermissions = await this.hasPermissions();
        return contactValue?.enabled && contactValue?.visible && !contactValue?.readonly && hasPermissions;
    }

    public canRun(): boolean {
        const contactValue = this.objectValueMapper?.findFormValue(TicketProperty.CONTACT_ID);
        return contactValue?.enabled && contactValue?.visible && !contactValue?.readonly;
    }

    public async run(event: any): Promise<void> {
        const newContactContext = await ContextService.getInstance().setActiveContext(
            NewContactDialogContext.CONTEXT_ID, null, null, [['USE_SOURCE_CONTEXT', true]]
        );

        ContextService.getInstance().registerListener({
            constexServiceListenerId: this.contextListenerId,
            beforeDestroy: async (context: NewContactDialogContext): Promise<void> => {
                if (context.instanceId === newContactContext.instanceId) {
                    this.setContactId(context.contactId);
                }
            },
            contextChanged: () => null,
            contextRegistered: () => null,
        });

    }

    public destroy(): void {
        ContextService.getInstance().unregisterListener(this.contextListenerId);
    }

    private setContactId(contactId: number): void {
        const formValue = this.objectValueMapper.findFormValue(TicketProperty.CONTACT_ID);
        if (formValue) {
            formValue.setFormValue(contactId);
        }
    }

    private async hasPermissions(): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(this.permissions);
    }

}