/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { RoutingConfiguration } from "../../../../../model/configuration/RoutingConfiguration";
import { IdService } from "../../../../../model/IdService";
import { TicketLabelProvider, TicketDetailsContext, TicketService } from "../../core";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { Ticket } from "../../../model/Ticket";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { SysConfigUtil } from "../../../../../modules/base-components/webapp/core/SysConfigUtil";
import { ActionFactory } from "../../../../../modules/base-components/webapp/core/ActionFactory";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { ObjectIcon } from "../../../../icon/model/ObjectIcon";
import { Context } from "vm";
import {
    ObjectInformationWidgetConfiguration
} from "../../../../../model/configuration/ObjectInformationWidgetConfiguration";
import { TicketProperty } from "../../../model/TicketProperty";
import { DynamicField } from "../../../../dynamic-fields/model/DynamicField";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../../../dynamic-fields/model/DynamicFieldProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { Label } from "../../../../base-components/webapp/core/Label";

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    private routingConfigurations: Array<[string, RoutingConfiguration]>;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('ticket-info-');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketLabelProvider();

        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListernerId, {
            sidebarToggled: () => { (this as any).setStateDirty('ticket'); },
            explorerBarToggled: () => { (this as any).setStateDirty('ticket'); },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            },
            additionalInformationChanged: () => { return; }
        });

        await this.initWidget(await context.getObject<Ticket>());
        this.state.prepared = true;
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.ticket = ticket;

        let properties;

        const settings: ObjectInformationWidgetConfiguration = this.state.widgetConfiguration ?
            this.state.widgetConfiguration.configuration : null;
        if (settings) {
            properties = settings.properties;
            this.routingConfigurations = settings.routingConfigurations;
        }

        if (this.state.ticket) {
            const isPending = await TicketService.getInstance().hasPendingState(this.state.ticket);
            const isAccountTimeEnabled = await SysConfigUtil.isTimeAccountingEnabled();

            if (!isPending) {
                properties = properties.filter((p) => p !== TicketProperty.PENDING_TIME);
            }
            if (!isAccountTimeEnabled) {
                properties = properties.filter((p) => p !== TicketProperty.TIME_UNITS);
            }

            const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
                TicketDetailsContext.CONTEXT_ID
            );

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
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticket]
            );
        }
    }

    public getIcon(object: string, objectId: string): ObjectIcon {
        return new ObjectIcon(object, objectId);
    }

    private async initContact(context: Context): Promise<void> {
        const config = context ? context.getWidgetConfiguration('contact-info-overlay') : undefined;
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
        const config = context ? context.getWidgetConfiguration('organisation-info-overlay') : undefined;
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
            if (p.match(/^DynamicFields?\..+/)) {
                const dfName = p.replace(/^DynamicFields?\.(.+)/, '$1');
                if (dfName) {
                    const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                        KIXObjectType.DYNAMIC_FIELD, null,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                    FilterType.AND, dfName
                                )
                            ], null, 1, [DynamicFieldProperty.CONFIG]
                        ), null, true
                    ).catch(() => [] as DynamicField[]);
                    if (dynamicFields.length && dynamicFields[0] && dynamicFields[0].ValidID === 1) {
                        validProperties.push(p);
                    }
                    const dfValue = this.state.ticket.DynamicFields ?
                        this.state.ticket.DynamicFields.find((dfv) => dfv.Name === dfName) : null;
                    if (dfValue) {
                        const value = await this.state.labelProvider.getDFDisplayValues(dfValue);
                        if (Array.isArray(value[0]) && value[0].length > 1) {
                            this.state.dynamicFieldLabels[p] = {
                                Name: dfValue.Label,
                                Labels: value[0].map(
                                    (v) => new Label(null, p, null, v, null, v)
                                )
                            };
                        }
                    }
                }
            } else {
                validProperties.push(p);
            }
        }
        return validProperties;
    }

}

module.exports = Component;
