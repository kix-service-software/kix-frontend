/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { TicketListContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ToggleOptions } from '../table/model/ToggleOptions';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketListContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const tableConfig = new TableConfiguration(
            'user-ticket-list-table', 'User Ticket List Table', ConfigurationType.Table,
            KIXObjectType.TICKET, new KIXObjectLoadingOptions([
                new FilterCriteria(
                    'StateType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
                )
            ]),
            null, null, null, true, true, new ToggleOptions('ticket-article-details', 'article', [], true),
            null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        configurations.push(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'user-ticket-list-table-widget-config', 'User Ticket List Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.TICKET, null,
            new ConfigurationDefinition('user-ticket-list-table', ConfigurationType.Table)
        );
        configurations.push(tableWidgetConfig);

        const tableWidget = new WidgetConfiguration(
            'user-ticket-list-table-widget', 'User Ticket List Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Tickets',
            [
                'bulk-action', 'ticket-create-action', 'ticket-search-action', 'csv-export-action'
            ],
            new ConfigurationDefinition('user-ticket-list-table-widget-config', ConfigurationType.TableWidget),
            null, false, false, 'kix-icon-ticket', true
        );
        configurations.push(tableWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'User Ticket List', ConfigurationType.Context,
                this.getModuleId(),
                [],
                [], [],
                [
                    new ConfiguredWidget('user-ticket-list-table-widget', 'user-ticket-list-table-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
