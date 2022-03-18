/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { Organisation } from '../../../model/Organisation';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
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

        context.registerListener('organisation-assigned-config-items-component', {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (orgId: string, organisation: Organisation, type: KIXObjectType) => {
                if (type === KIXObjectType.ORGANISATION) {
                    this.initWidget(organisation);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.initWidget(await context.getObject<Organisation>(KIXObjectType.ORGANISATION));
    }

    private async initWidget(organisation: Organisation): Promise<void> {

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [OrganisationProperty.ASSIGNED_CONFIG_ITEMS]
        );
        const organisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, [organisation.ID], loadingOptions, null, true, null, true
        );

        if (organisations && organisations.length) {
            if (!organisations[0].AssignedConfigItems || !organisations[0].AssignedConfigItems.length) {
                const groupComponent = (this as any).getComponent('organisation-assigned-config-items-widget');
                if (groupComponent) {
                    groupComponent.setMinizedState(true);
                }
            }

            const title = await TranslationService.translate(this.state.widgetConfiguration.title);
            const count = (organisations[0].AssignedConfigItems)
                ? ` (${organisations[0].AssignedConfigItems.length})`
                : ' (0)';
            this.state.title = title + count;
            this.prepareTable(organisations[0]);
        }
    }

    private async prepareTable(organisation: Organisation): Promise<void> {
        if (organisation && this.state.widgetConfiguration) {
            this.state.table = await TableFactoryService.getInstance().createTable(
                'organisation-assigned-config-items', KIXObjectType.CONFIG_ITEM,
                this.state.widgetConfiguration.configuration as TableConfiguration,
                organisation.AssignedConfigItems, null, true, true, true
            );
        }
    }
}

module.exports = Component;
