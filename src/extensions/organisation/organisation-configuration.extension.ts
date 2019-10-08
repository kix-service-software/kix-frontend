/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, KIXObjectType, CRUD,
    TableWidgetSettings, KIXObjectLoadingOptions, FilterCriteria, KIXObjectProperty, FilterDataType, FilterType
} from '../../core/model';
import { TableConfiguration, SearchOperator } from '../../core/browser';
import { OrganisationContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const organisationListWidget = new ConfiguredWidget('20180529102830',
            new WidgetConfiguration(
                'table-widget', 'Translatable#Overview Organisations', [
                    'organisation-search-action',
                    'organisation-create-action',
                    'import-action',
                    'csv-export-action'
                ],
                new TableWidgetSettings(
                    KIXObjectType.ORGANISATION, null,
                    new TableConfiguration(
                        KIXObjectType.ORGANISATION, null,
                        null, null, true
                    )
                ),
                false, true, 'kix-icon-man-house', true
            ),
            [new UIComponentPermission('organisations', [CRUD.READ])]
        );

        const contactListWidget =
            new ConfiguredWidget('20180529144530',
                new WidgetConfiguration(
                    'contact-list-widget', 'Translatable#Overview Contacts', [
                        'contact-search-action',
                        'contact-create-action',
                        'import-action',
                        'contact-csv-export-action'
                    ], new TableWidgetSettings(
                        KIXObjectType.CONTACT, null,
                        new TableConfiguration(
                            KIXObjectType.CONTACT, null,
                            null, null, true
                        ), null, true, null, null, null, false
                    ),
                    false, true, 'kix-icon-man-bubble', true
                ),
                [new UIComponentPermission('contacts', [CRUD.READ])]
            );

        const content: string[] = ['20180529102830', '20180529144530'];
        const contentWidgets = [organisationListWidget, contactListWidget];

        const notesSidebar =
            new ConfiguredWidget('20181010-organisation-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
                false, false, 'kix-icon-note', false)
            );

        const sidebars = ['20181010-organisation-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            [], [],
            [], [],
            content, contentWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
