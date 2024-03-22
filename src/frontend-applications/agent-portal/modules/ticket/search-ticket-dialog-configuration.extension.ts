/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketSearchContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SearchForm } from '../../modules/base-components/webapp/core/SearchForm';
import { FormContext } from '../../model/configuration/FormContext';
import { SearchProperty } from '../search/model/SearchProperty';
import { TicketProperty } from './model/TicketProperty';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { TableHeaderHeight } from '../table/model/TableHeaderHeight';
import { TableRowHeight } from '../table/model/TableRowHeight';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const tableConfig = new TableConfiguration(
            'ticket-search-table-config', 'Ticket Search Table Configuration', ConfigurationType.Table,
            KIXObjectType.TICKET, null, null, null, [], true, true, null, null, TableHeaderHeight.LARGE,
            TableRowHeight.LARGE
        );
        configurations.push(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'ticket-search-table-widget-settings', 'Ticket Search Table Widget Settings',
            ConfigurationType.TableWidget, KIXObjectType.TICKET, null, null, tableConfig
        );
        tableWidgetConfig.showFilter = false;

        configurations.push(tableWidgetConfig);

        const ticketListConfig = new WidgetConfiguration(
            'ticket-search-ticket-list-widget', 'Ticket Search List Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Search Results: Tickets', ['bulk-action', 'csv-export-action'],
            null, tableWidgetConfig, false, false, 'kix-icon-ticket', true
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Search', ConfigurationType.Context, this.getModuleId(),
                [], [], [],
                [
                    new ConfiguredWidget('ticket-search-ticket-list-widget', null, ticketListConfig)
                ]
            )
        );

        return configurations;
    }


    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-search-form';
        configurations.push(
            new SearchForm(
                formId, 'Ticket Search', KIXObjectType.TICKET, FormContext.SEARCH, null,
                [SearchProperty.FULLTEXT, TicketProperty.TITLE, TicketProperty.QUEUE_ID]
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.TICKET, formId);

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
