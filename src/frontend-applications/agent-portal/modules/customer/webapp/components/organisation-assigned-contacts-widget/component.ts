/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Organisation } from '../../../model/Organisation';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener('organisation-assigned-contacts-component', {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, organisation: Organisation, type: KIXObjectType) => {
                if (type === KIXObjectType.ORGANISATION) {
                    this.initWidget(organisation);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });

        await this.initWidget(await context.getObject<Organisation>());
    }

    private async initWidget(organisation: Organisation): Promise<void> {
        this.state.organisation = organisation;
        this.prepareTable();
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.organisation) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.organisation]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.organisation && this.state.widgetConfiguration) {

            const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [
                OrganisationProperty.CONTACTS, OrganisationProperty.TICKET_STATS
            ]);
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [this.state.organisation.ID], loadingOptions, null, true, null, true
            );

            if (organisations && organisations.length && organisations[0].Contacts) {
                const contactIds = organisations[0].Contacts.map((c) => typeof c === 'string' ? c : c.ID);
                this.state.table = await TableFactoryService.getInstance().createTable(
                    'organisation-assigned-contacts', KIXObjectType.CONTACT,
                    this.state.widgetConfiguration.configuration as TableConfiguration,
                    contactIds, null, true
                );
            }

            const title = await TranslationService.translate(this.state.widgetConfiguration.title);
            const count = organisations[0].Contacts && !!organisations[0].Contacts.length
                ? ` (${organisations[0].Contacts.length})`
                : ' (0)';
            this.state.title = `${title} ${count}`;
        }
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }
}

module.exports = Component;
