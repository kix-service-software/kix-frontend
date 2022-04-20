/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { User } from '../../../model/User';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { RoleProperty } from '../../../model/RoleProperty';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { IdService } from '../../../../../model/IdService';
import { UserDetailsContext } from '../../core/admin/context/user';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        context.registerListener('user-assigned-roles-widget', {
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (userId: string, user: User, type: KIXObjectType | string) => {
                if (type === KIXObjectType.USER) {
                    this.initWidget(user);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<User>());
    }

    private async initWidget(user: User): Promise<void> {
        const columns = [
            new DefaultColumnConfiguration(null, null, null,
                RoleProperty.NAME, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                RoleProperty.COMMENT, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(
                null, null, null, RoleProperty.VALID_ID, true, false, true, false, 100, true, true
            )
        ];
        const tableConfiguration = new TableConfiguration(null, null, null,
            KIXObjectType.ROLE, null, null, columns, [], false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            IdService.generateDateBasedId('user-assigned-roles-'), KIXObjectType.ROLE, tableConfiguration, null,
            UserDetailsContext.CONTEXT_ID, true, undefined, false, true, true
        );
        this.state.table = table;
        this.prepareActions(user);
        this.prepareTitle(user);
    }

    private async prepareTitle(user: User): Promise<void> {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
        title = await TranslationService.translate(title);
        const count = user.RoleIDs ? user.RoleIDs.length : 0;
        this.state.title = `${title} (${count})`;
    }

    private async prepareActions(user: User): Promise<void> {
        if (this.state.widgetConfiguration && user) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [user]
            );
        }
    }

}

module.exports = Component;
