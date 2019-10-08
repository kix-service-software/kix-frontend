/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { OrganisationContext } from '../context';
import { OrganisationAdditionalInformationKeys } from '../context/OrganisationContext';

export class ContactTableDependingAction extends AbstractAction {

    private isActive = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Activate dependency to organisation';
        this.icon = 'kix-icon-dependence';
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );

        if (context) {
            const isDepending = context.getAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
            );
            this.isActive = isDepending;
        }
    }

    public async setData(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );

        if (context) {
            if (this.isActive) {
                this.text = 'Translatable#Deactivate dependency to organisation';
                this.icon = 'kix-icon-dependence-remove';
            } else {
                this.text = 'Translatable#Activate dependency to organisation';
                this.icon = 'kix-icon-dependence';
            }
        }
    }

    public async run(event: any): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );
        if (context) {
            this.isActive = !this.isActive;
            context.setAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING, this.isActive
            );

            context.loadContacts();
        }
    }

}
