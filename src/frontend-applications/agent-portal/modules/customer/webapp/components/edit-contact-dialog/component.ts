/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';

import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractEditDialog } from '../../../../base-components/webapp/core/AbstractEditDialog';
import { ContactDetailsContext } from '../../core';
import { Contact } from '../../../model/Contact';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ContactProperty } from '../../../model/ContactProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterType } from '../../../../../model/FilterType';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { UserDetailsContext } from '../../../../user/webapp/core/admin';

class Component extends AbstractEditDialog {

    private isAgentDialog: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (dialogContext) {
            this.isAgentDialog = Boolean(dialogContext.getAdditionalInformation('IS_AGENT_DIALOG'));
        }
        super.init(
            this.isAgentDialog ? 'Translatable#Update Agent' : 'Translatable#Update Contact',
            undefined,
            KIXObjectType.CONTACT,
            this.isAgentDialog ? null : ContactDetailsContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        await super.onMount();
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async cancel(): Promise<void> {
        super.cancel();
    }

    public async submit(): Promise<void> {
        let contactId;
        if (this.isAgentDialog) {
            const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (dialogContext) {
                const userId = dialogContext.getAdditionalInformation('USER_ID');
                if (userId) {
                    const contact = await this.loadContact(userId);
                    contactId = contact ? contact.ID : null;
                }
            }
        }
        await super.submit(contactId);
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        if (this.isAgentDialog && objectId) {
            this.contextId = UserDetailsContext.CONTEXT_ID;
            this.objectType = KIXObjectType.USER;
        }
        super.handleDialogSuccess(objectId);
    }

    private async loadContact(userId: number): Promise<Contact> {
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
        return contact;
    }

}

module.exports = Component;
