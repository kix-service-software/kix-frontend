/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { OrganisationAdditionalInformationKeys, OrganisationContext } from '../context/OrganisationContext';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';

export class ContactTableDependingAction extends AbstractAction {

    private isActive = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Activate dependency to organisation';
        this.icon = 'kix-icon-dependence';
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const isDepending = context.getAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
            );
            this.isActive = isDepending;
        }
    }

    public async setData(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            if (this.isActive) {
                this.text = 'Translatable#Remove dependency to organisation';
                this.icon = 'kix-icon-dependence-remove';
            } else {
                this.text = 'Translatable#Activate dependency to organisation';
                this.icon = 'kix-icon-dependence';
            }
        }
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as OrganisationContext;
        if (context) {
            this.isActive = !this.isActive;
            context.setAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING, this.isActive
            );

            context.loadContacts();
        }
    }

}
