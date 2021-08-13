/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { TicketLabelProvider, TicketDetailsContext, TicketService } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import {
    ObjectInformationWidgetConfiguration
} from '../../../../../model/configuration/ObjectInformationWidgetConfiguration';
import { TicketProperty } from '../../../model/TicketProperty';
import { Context } from '../../../../../model/Context';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    private routingConfigurations: Array<[string, RoutingConfiguration]>;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketLabelProvider();

        const context = ContextService.getInstance().getActiveContext();

        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.subscriber = {
            eventSubscriberId: 'ticket-info-widget',
            eventPublished: (data, eventId: string) => {
                if (data.objectType === KIXObjectType.TICKET) {
                    this.initWidget();
                }
            }
        };

        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);

        this.initWidget();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
    }

    private async initWidget(): Promise<void> {
        this.state.prepared = false;
        const context = ContextService.getInstance().getActiveContext();
        this.state.ticket = await context.getObject<Ticket>();

        let properties = [];

        const settings = this.state.widgetConfiguration
            ? this.state.widgetConfiguration.configuration as ObjectInformationWidgetConfiguration
            : null;
        if (settings) {
            properties = settings.properties;
            this.routingConfigurations = settings.routingConfigurations;
        }

        if (this.state.ticket) {
            const isPending = await TicketService.isPendingState(this.state.ticket.StateID);

            if (!isPending) {
                properties = properties.filter((p) => p !== TicketProperty.PENDING_TIME);
            }

            if (properties.some((p) => p === TicketProperty.ORGANISATION_ID)) {
                this.initOrganisation(context);
            }
            if (properties.some((p) => p === TicketProperty.CONTACT_ID)) {
                this.initContact(context);
            }
        }

        properties = await this.prepareDynamicFields(properties);

        this.state.properties = properties;

        this.setActions();

        this.state.prepared = true;
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticket]
            );
        }
    }

    public getIcon(object: string, objectId: string): ObjectIcon {
        return new ObjectIcon(null, object, objectId);
    }

    private async initContact(context: Context): Promise<void> {
        const config = context ? await context.getWidgetConfiguration('contact-info-overlay') : undefined;
        if (!isNaN(Number(this.state.ticket.ContactID))) {

            if (config && config.configuration) {
                const contacts = await KIXObjectService.loadObjects(
                    KIXObjectType.CONTACT, [this.state.ticket.ContactID]
                );
                this.state.contact = contacts && contacts.length ? contacts[0] : null;

                const settings = config.configuration as ObjectInformationWidgetConfiguration;
                this.state.contactProperties = settings.properties;
            }
        }
    }

    private async initOrganisation(context: Context): Promise<void> {
        const config = context ? await context.getWidgetConfiguration('organisation-info-overlay') : undefined;
        if (!isNaN(Number(this.state.ticket.OrganisationID))) {

            if (config && config.configuration) {
                const organisation = await KIXObjectService.loadObjects(
                    KIXObjectType.ORGANISATION, [this.state.ticket.OrganisationID]
                );
                this.state.organisation = organisation && organisation.length ? organisation[0] : null;

                const settings = config.configuration as ObjectInformationWidgetConfiguration;
                this.state.organisationProperties = settings.properties;
            }
        }
    }

    public getRoutingConfiguration(property: string): RoutingConfiguration {
        if (this.routingConfigurations && !!this.routingConfigurations.length) {
            const config = this.routingConfigurations.find((rc) => rc[0] === property);
            return config ? config[1] : undefined;
        }
    }

    private async prepareDynamicFields(properties: string[]): Promise<string[]> {
        const validProperties = [];
        for (const p of properties) {
            const dfName = KIXObjectService.getDynamicFieldName(p);
            if (dfName) {
                const dynamicField = await KIXObjectService.loadDynamicField(dfName);

                if (dynamicField && dynamicField.ValidID === 1) {
                    validProperties.push(p);
                }
            } else {
                validProperties.push(p);
            }
        }
        return validProperties;
    }

    public getDynamicFieldName(property: string): string {
        return KIXObjectService.getDynamicFieldName(property);
    }

}

module.exports = Component;
