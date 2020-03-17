/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractNewDialog } from '../../../../../modules/base-components/webapp/core/AbstractNewDialog';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContactDetailsContext } from '../../core';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContactProperty } from '../../../model/ContactProperty';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { UserDetailsContext } from '../../../../user/webapp/core/admin';
import { UserProperty } from '../../../../user/model/UserProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Contact } from '../../../model/Contact';

class Component extends AbstractNewDialog {

    private contactRoutingConfig: RoutingConfiguration;
    private isAgentDialog: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contactRoutingConfig = new RoutingConfiguration(
            ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
            ContextMode.DETAILS, ContactProperty.ID, true
        );
        let routingConfig;
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (dialogContext) {
            this.isAgentDialog = Boolean(dialogContext.getAdditionalInformation('IS_AGENT_DIALOG'));
            if (this.isAgentDialog) {
                routingConfig = new RoutingConfiguration(
                    UserDetailsContext.CONTEXT_ID, KIXObjectType.USER,
                    ContextMode.DETAILS, UserProperty.USER_ID, true
                );
            }
        }
        super.init(
            'Translatable#Create Contact',
            'Translatable#Contact successfully created.',
            KIXObjectType.CONTACT,
            routingConfig ? routingConfig : this.contactRoutingConfig
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        if (this.isAgentDialog && objectId) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [objectId], null, null, true
            ).catch(() => [] as Contact[]);
            if (contacts && contacts[0] && contacts[0].AssignedUserID) {
                objectId = contacts[0].AssignedUserID;
            } else {
                this.routingConfiguration = this.contactRoutingConfig;
            }
        }
        super.handleDialogSuccess(objectId);
    }

}

module.exports = Component;
