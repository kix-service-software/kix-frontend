/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { Context } from '../../../../../model/Context';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { UserProperty } from '../../../model/UserProperty';
import { AgentService } from '../../core/AgentService';
import { PersonalSettingsProperty } from '../../../model/PersonalSettingsProperty';
import { ContactProperty } from '../../../../customer/model/ContactProperty';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContactDetailsContext } from '../../../../customer/webapp/core/context/ContactDetailsContext';
import { ContextMode } from '../../../../../model/ContextMode';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;

    public onCreate(): void {
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

        await this.initWidget(context);
    }

    private async initWidget(context: Context): Promise<void> {
        const outOfOfficeUsersIDs = await AgentService.getInstance().getOutOfOfficeUserIds();

        const columns = [
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.FIRSTNAME, true, false, true, false, 100, true, true, true,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.LASTNAME, true, false, true, false, 100, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                UserProperty.USER_LOGIN, true, false, true, false, 100, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                PersonalSettingsProperty.OUT_OF_OFFICE_END, true, false, true, false, 80, true, false, true,
                DataType.DATE, true, null, null, false
            )
        ];
        const tableConfiguration = new TableConfiguration(null, null, null,
            KIXObjectType.USER, null, 32, columns, [], false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            'out-of-office-users', KIXObjectType.USER, tableConfiguration, outOfOfficeUsersIDs,
            context.contextId, false, undefined, false, true, true
        );
        table.getTableConfiguration().routingConfiguration = new RoutingConfiguration(
            ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
            ContextMode.DETAILS, `${UserProperty.CONTACT}.ID`
        );
        this.state.table = table;
    }
}

module.exports = Component;