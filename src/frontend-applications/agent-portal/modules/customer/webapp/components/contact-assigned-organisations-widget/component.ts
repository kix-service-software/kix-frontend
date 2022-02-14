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
import { Contact } from '../../../model/Contact';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ContactProperty } from '../../../model/ContactProperty';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
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

        context.registerListener('contact-assigned-organisations-component', {
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

        this.initWidget(await context.getObject<Contact>());
    }

    private async initWidget(contact?: Contact): Promise<void> {
        this.state.contact = contact;
        this.prepareTable();
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [
            ContactProperty.TICKET_STATS
        ]);
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
}

module.exports = Component;
