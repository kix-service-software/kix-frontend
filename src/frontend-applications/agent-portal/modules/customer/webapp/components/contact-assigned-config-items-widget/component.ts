/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ContactProperty } from '../../../model/ContactProperty';
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

        context.registerListener('contact-assigned-config-items-component', {
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

        this.initWidget(await context.getObject<Contact>(KIXObjectType.CONTACT));
    }

    private async initWidget(contact: Contact): Promise<void> {

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [
            ContactProperty.ASSIGNED_CONFIG_ITEMS
        ]);
        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, [contact.ID], loadingOptions
        );

        if (contacts && contacts.length) {
            if (!contacts[0].AssignedConfigItems || !contacts[0].AssignedConfigItems.length) {
                const groupComponent = (this as any).getComponent('contact-assigned-config-items-widget');
                if (groupComponent) {
                    groupComponent.setMinizedState(true);
                }
            }
            const title = await TranslationService.translate(this.state.widgetConfiguration.title);
            const count = (contacts[0].AssignedConfigItems)
                ? ` (${contacts[0].AssignedConfigItems.length})`
                : ' (0)';
            this.state.title = title + count;
            this.prepareTable(contacts[0]);
        }
    }

    private async prepareTable(contact: Contact): Promise<void> {
        if (contact && this.state.widgetConfiguration) {
            this.state.table = await TableFactoryService.getInstance().createTable(
                'contact-assigned-config-items', KIXObjectType.CONFIG_ITEM,
                this.state.widgetConfiguration.configuration as TableConfiguration,
                contact.AssignedConfigItems, null, true, true, true
            );
        }
    }
}

module.exports = Component;
