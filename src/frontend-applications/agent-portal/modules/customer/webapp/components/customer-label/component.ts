/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Organisation } from '../../../model/Organisation';
import { Contact } from '../../../model/Contact';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContactProperty } from '../../../model/ContactProperty';
import { UserProperty } from '../../../../user/model/UserProperty';
import { OrganisationDetailsContext } from '../../core/context/OrganisationDetailsContext';
import { ContactDetailsContext } from '../../core/context/ContactDetailsContext';

class Component {

    private state: ComponentState;

    public routingConfiguration: RoutingConfiguration;
    public objectId: number;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.labelProvider = input.labelProvider;
        this.state.property = input.property;
        this.state.object = input.object;
        if (this.state.object.KIXObjectType === KIXObjectType.ORGANISATION) {
            this.objectId = (this.state.object as Organisation).ID;
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            this.objectId = (this.state.object as Contact).ID;
        }
    }

    public async onMount(): Promise<void> {
        this.state.propertyText = await this.state.labelProvider.getPropertyText(this.state.property);
        this.state.displayText = await this.state.labelProvider.getDisplayText(this.state.object, this.state.property);
        await this.initRoutingConfiguration();
        this.state.title = `${this.state.propertyText}: ${this.state.displayText}`;
    }

    private async initRoutingConfiguration(): Promise<void> {
        if (this.state.object.KIXObjectType === KIXObjectType.ORGANISATION) {
            if (
                this.state.property === OrganisationProperty.ID
                || this.state.property === OrganisationProperty.NAME
            ) {
                this.routingConfiguration = new RoutingConfiguration(
                    OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
                    ContextMode.DETAILS, OrganisationProperty.ID, false
                );
            }
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            if (
                this.state.property === ContactProperty.FIRSTNAME
                || this.state.property === ContactProperty.LASTNAME
                || this.state.property === UserProperty.USER_LOGIN
            ) {
                this.routingConfiguration = new RoutingConfiguration(
                    ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                    ContextMode.DETAILS, ContactProperty.ID, false
                );
            }
        }
    }
}

module.exports = Component;
