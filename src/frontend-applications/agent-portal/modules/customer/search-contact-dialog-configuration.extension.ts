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
import { ContactSearchContext } from './webapp/core/context/ContactSearchContext';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const tableConfig = new TableConfiguration(
            'contact-search-table', 'Contact Search Table', ConfigurationType.Table, KIXObjectType.CONTACT
        );
        configurations.push(tableConfig);

        const tableWidget = new TableWidgetConfiguration(
            'contact-search-table-widget', 'Contact Search Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONTACT, null, null, tableConfig
        );
        configurations.push(tableWidget);

        const contactListWidget = new WidgetConfiguration(
            'contact-search-widget', 'Contact Search Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Search Results: Contacts', ['csv-export-action'],
            null, tableWidget, false, false, 'kix-icon-man-bubble', true
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Contact Search', ConfigurationType.Context, this.getModuleId(),
                [], [], [],
                [
                    new ConfiguredWidget('contact-search-widget', null, contactListWidget)
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
