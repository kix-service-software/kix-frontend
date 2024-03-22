/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { OrganisationSearchContext } from './webapp/core/context/OrganisationSearchContext';

export class Extension extends KIXExtension implements IConfigurationExtension {


    public getModuleId(): string {
        return OrganisationSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const tableConfig = new TableConfiguration(
            'organisation-search-table', 'Organisation Search Table', ConfigurationType.Table, KIXObjectType.ORGANISATION
        );
        configurations.push(tableConfig);

        const tableWidget = new TableWidgetConfiguration(
            'organisation-search-table-widget', 'Organisation Search Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.ORGANISATION, null, null, tableConfig
        );
        tableWidget.showFilter = false;

        configurations.push(tableWidget);

        const listWidget = new WidgetConfiguration(
            'organisation-search-widget', 'Organisation Search Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Search Results: Organisations', ['csv-export-action'],
            null, tableWidget, false, false, 'kix-icon-man-house', true
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Organisation Search', ConfigurationType.Context, this.getModuleId(),
                [], [], [],
                [
                    new ConfiguredWidget('organisation-search-widget', null, listWidget)
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
