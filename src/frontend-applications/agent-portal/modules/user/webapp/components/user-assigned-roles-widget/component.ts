/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { UserDetailsContext } from '../../core/admin';
import { User } from '../../../model/User';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { DefaultColumnConfiguration } from '../../../../../server/services/configuration/DefaultColumnConfiguration';
import { RoleProperty } from '../../../model/RoleProperty';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<UserDetailsContext>(
            UserDetailsContext.CONTEXT_ID
        );

        context.registerListener('user-assigned-roles-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (userId: string, user: User, type: KIXObjectType | string) => {
                if (type === KIXObjectType.USER) {
                    this.initWidget(user);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<User>());
    }

    public onDestroy(): void {
        TableFactoryService.getInstance().destroyTable('user-assigned-roles');
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
            'user-assigned-roles', KIXObjectType.ROLE, tableConfiguration, null,
            UserDetailsContext.CONTEXT_ID, true, undefined, false, true, true
        );
        this.state.table = table;
        this.prepareActions(user);
        this.prepareTitle(user);
    }

    private async prepareTitle(user: User): Promise<void> {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
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