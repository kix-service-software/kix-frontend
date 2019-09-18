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
    ContextConfiguration, WidgetConfiguration, WidgetSize, ConfiguredWidget, ConfigItemProperty,
    FormField, VersionProperty, FormFieldOption, FormContext, KIXObjectType, Form,
    KIXObjectPropertyFilter, TableFilterCriteria, CRUD, TableWidgetSettings
} from '../../core/model';
import { CMDBContext, ConfigItemChartConfiguration } from '../../core/browser/cmdb';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService, CMDBService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = ['20180830-cmdb-notes-sidebar'];

        const notesSidebar = new ConfiguredWidget('20180830-cmdb-notes-sidebar',
            new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {}, false, false, 'kix-icon-note', false
            ));

        const sidebarWidgets = [notesSidebar];

        const explorer = ['20180830-ci-class-explorer'];

        const ciClassExplorer = new ConfiguredWidget('20180830-ci-class-explorer',
            new WidgetConfiguration(
                'config-item-class-explorer', 'Translatable#CMDB Explorer', [], {}, false, false
            ),
            [new UIComponentPermission('system/cmdb/classes', [CRUD.READ])]
        );
        const explorerWidgets = [ciClassExplorer];


        // CONTENT WIDGETS

        const chartConfig1 = new ConfigItemChartConfiguration(ConfigItemProperty.CLASS_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    backgroundColor: [
                        "rgb(91, 91, 91)",
                        "rgb(4, 83, 125)",
                        "rgb(0, 141, 210)",
                        "rgb(129, 189, 223)",
                        "rgb(160, 230, 200)",
                        "rgb(130, 200, 38)",
                        "rgb(0, 152, 70)",
                        "rgb(227, 30, 36)",
                        "rgb(239, 127, 26)",
                        "rgb(254, 204, 0)"
                    ]
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
        const chart1 = new ConfiguredWidget('20180903-cmdb-chart-1',
            new WidgetConfiguration(
                'config-item-chart-widget', 'Translatable#Number of Config Items', [], chartConfig1,
                false, true, null, true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const chartConfig2 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_DEPL_STATE_ID, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    label: '',
                    data: [],
                    fill: true,
                    backgroundColor: [
                        "rgb(91, 91, 91)",
                        "rgb(4, 83, 125)",
                        "rgb(0, 141, 210)",
                        "rgb(129, 189, 223)",
                        "rgb(160, 230, 200)",
                        "rgb(130, 200, 38)",
                        "rgb(0, 152, 70)",
                        "rgb(227, 30, 36)",
                        "rgb(239, 127, 26)",
                        "rgb(254, 204, 0)"
                    ]
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        });
        const chart2 = new ConfiguredWidget('20180903-cmdb-chart-2',
            new WidgetConfiguration(
                'config-item-chart-widget', 'Translatable#Overview Config Items Deployment State', [], chartConfig2,
                false, true, null, true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const chartConfig3 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_INCI_STATE_ID, {
            type: 'bar',
            data: {
                datasets: [{
                    backgroundColor: [
                        "rgb(91, 91, 91)",
                        "rgb(4, 83, 125)",
                        "rgb(0, 141, 210)",
                        "rgb(129, 189, 223)",
                        "rgb(160, 230, 200)",
                        "rgb(130, 200, 38)",
                        "rgb(0, 152, 70)",
                        "rgb(227, 30, 36)",
                        "rgb(239, 127, 26)",
                        "rgb(254, 204, 0)"
                    ]
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'top'
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            stepSize: 1
                        }

                    }]
                }
            }
        });
        const chart3 = new ConfiguredWidget('20180903-cmdb-chart-3',
            new WidgetConfiguration(
                'config-item-chart-widget', 'Translatable#Number of Config Items in critical incident state',
                [], chartConfig3, false, true, null, true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const content = [
            '20180903-cmdb-chart-1', '20180903-cmdb-chart-2', '20180903-cmdb-chart-3', '20180905-ci-list-widget'
        ];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const deploymentStates = await CMDBService.getInstance().getDeploymentStates(serverConfig.BACKEND_API_TOKEN);
        const filter: KIXObjectPropertyFilter[] = [];
        deploymentStates.forEach(
            (ds) => filter.push(new KIXObjectPropertyFilter(ds.Name, [
                new TableFilterCriteria(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.EQUALS, ds.ItemID
                )
            ])));

        const ciListWidget = new ConfiguredWidget('20180905-ci-list-widget',
            new WidgetConfiguration(
                'table-widget', 'Translatable#Overview Config Items', [
                    'ticket-create-action', 'config-item-create-action', 'csv-export-action'
                ],
                new TableWidgetSettings(KIXObjectType.CONFIG_ITEM, null, null, null, true, null, filter),
                false, false, 'kix-icon-ci', true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])],
            WidgetSize.LARGE
        );

        const contentWidgets = [chart1, chart2, chart3, ciListWidget];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            explorer, explorerWidgets,
            [], [],
            content, contentWidgets
        );
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const linkFormId = 'link-config-item-search-form';
        const existingForm = configurationService.getConfiguration(linkFormId);
        if (!existingForm || overwrite) {
            const fields: FormField[] = [];
            fields.push(
                new FormField(
                    'Translatable#Config Item Class', ConfigItemProperty.CLASS_ID,
                    'ci-class-input', false,
                    'Translatable#Helptext_CMDB_ConfigItem_Link_Class'
                )
            );
            fields.push(new FormField('Translatable#Name', ConfigItemProperty.NAME, null, false, 'Translatable#Helptext_CMDB_ConfigItem_Link_Name'));
            fields.push(new FormField('Translatable#Number', ConfigItemProperty.NUMBER, null, false, 'Translatable#Helptext_CMDB_ConfigItem_Link_Number'));
            fields.push(new FormField(
                'Translatable#Deployment State', VersionProperty.CUR_DEPL_STATE_ID, 'general-catalog-input',
                false, 'Translatable#Helptext_CMDB_ConfigItem_Link_DeploymentState',
                [new FormFieldOption('GC_CLASS', 'ITSM::ConfigItem::DeploymentState')],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));
            fields.push(new FormField(
                'Translatable#Incident State', VersionProperty.CUR_INCI_STATE_ID, 'general-catalog-input',
                false, 'Translatable#Helptext_CMDB_ConfigItem_Link_IncidentState',
                [new FormFieldOption('GC_CLASS', 'ITSM::Core::IncidentState')],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));

            const group = new FormGroup('Translatable#Config Item Data', fields);

            const form = new Form(
                linkFormId, 'Translatable#Link Config Item with', [group], KIXObjectType.CONFIG_ITEM, false, FormContext.LINK
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.CONFIG_ITEM, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
