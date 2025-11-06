/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { Contact } from '../../../model/Contact';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ContactProperty } from '../../../model/ContactProperty';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.context?.registerListener('contact-assigned-organisations-component', {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(contact);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.initWidget(await this.context?.getObject<Contact>());
    }

    private async initWidget(contact?: Contact): Promise<void> {
        this.state.contact = contact;
        this.prepareTable();
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact], this.contextInstanceId
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [ContactProperty.TICKET_STATS], null, null, 'CONTACT_TICKET_STATS'
        );
        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, [this.state.contact.ID], loadingOptions
        );

        if (contacts && contacts.length) {
            this.state.table = await TableFactoryService.getInstance().createTable(
                'contact-assigned-organisation', KIXObjectType.ORGANISATION,
                this.state.widgetConfiguration.configuration as TableConfiguration,
                this.state.contact.OrganisationIDs, null, true
            );

            const title = await TranslationService.translate(this.state.widgetConfiguration.title);
            const count = this.state.contact.OrganisationIDs && !!this.state.contact.OrganisationIDs.length
                ? ` (${contacts[0].OrganisationIDs.length})`
                : '';
            this.state.title = `${title} ${count}`;
        }
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
