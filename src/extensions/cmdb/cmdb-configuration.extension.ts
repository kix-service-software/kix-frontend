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
    VersionProperty, FormFieldOption, FormContext, KIXObjectType,
    CRUD, ObjectReferenceOptions,
    FilterType, GeneralCatalogItemProperty, FilterCriteria, FilterDataType, KIXObjectProperty,
    KIXObjectLoadingOptions, ChartComponentConfiguration, KIXObjectPropertyFilter, TableFilterCriteria,
    TableWidgetConfiguration
} from '../../core/model';
import { CMDBContext, ConfigItemChartWidgetConfiguration } from '../../core/browser/cmdb';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService, CMDBService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const notesSidebar = new WidgetConfiguration(
            'cmdb-dashboard-notes-widget', 'Notes Widget', ConfigurationType.Widget,
            'notes-widget', 'Translatable#Notes', [], null, null, false, false, 'kix-icon-note', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notesSidebar);

        const classExplorer = new WidgetConfiguration(
            'cmdb-dashboard-class-explorer', 'Class Explorer', ConfigurationType.Widget,
            'config-item-class-explorer', 'Translatable#CMDB Explorer', [], null, null, false, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(classExplorer);

        const chartConfig1 = new ChartComponentConfiguration(
            'cmdb-dashboard-ci-chart-class-items-count', 'Class Items Count Chart', ConfigurationType.Chart,
            {
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
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                maxTicksLimit: 6
                            }
                        }]
                    }
                }
            }
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartConfig1);

        const chartWidgetConfig1 = new ConfigItemChartWidgetConfiguration(
            'cmdb-dashboard-ci-chart-class-items-count-widget', null, ConfigurationType.ChartWidget,
            ConfigItemProperty.CLASS_ID,
            new ConfigurationDefinition('cmdb-dashboard-ci-chart-class-items-count', ConfigurationType.Chart)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartWidgetConfig1);

        const chart1 = new WidgetConfiguration(
            'cmdb-dashboard-ci-chart-items-count', 'Items Count', ConfigurationType.Widget,
            'config-item-chart-widget', 'Translatable#Number of Config Items', [],
            new ConfigurationDefinition(
                'cmdb-dashboard-ci-chart-class-items-count-widget', ConfigurationType.ChartWidget
            ),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chart1);

        const chartConfig2 = new ChartComponentConfiguration(
            'cmdb-dashboard-ci-deployment-state-chart', 'CI Deployment States', ConfigurationType.Chart,
            {
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
            }
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartConfig2);

        const chartWidgetConfig2 = new ConfigItemChartWidgetConfiguration(
            'cmdb-dashboard-ci-deployment-state-chart-widget', 'CI Deployment States Chart Widget',
            ConfigurationType.ChartWidget,
            ConfigItemProperty.CUR_DEPL_STATE_ID,
            new ConfigurationDefinition('cmdb-dashboard-ci-deployment-state-chart', ConfigurationType.Chart)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartWidgetConfig2);

        const chart2 = new WidgetConfiguration(
            'cmdb-dashboard-ci-chart-deployment-states', 'CI Chart Deployment States', ConfigurationType.Widget,
            'config-item-chart-widget', 'Translatable#Overview Config Items Deployment State', [],
            new ConfigurationDefinition(
                'cmdb-dashboard-ci-deployment-state-chart-widget', ConfigurationType.ChartWidget
            ),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chart2);

        const chartConfig3 = new ChartComponentConfiguration(
            'cmdb-dashboard-ci-incident-state-chart', 'CI Incident States', ConfigurationType.Chart,
            {
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
                                beginAtZero: true,
                                maxTicksLimit: 6
                            }
                        }]
                    }
                }
            }
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartConfig3);

        const chartWidgetConfig3 = new ConfigItemChartWidgetConfiguration(
            'cmdb-dashboard-ci-incident-state-chart-widget', 'CI Incident States Chart Widget',
            ConfigurationType.ChartWidget,
            ConfigItemProperty.CUR_INCI_STATE_ID,
            new ConfigurationDefinition('cmdb-dashboard-ci-incident-state-chart', ConfigurationType.Chart)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartWidgetConfig3);

        const chart3 = new WidgetConfiguration(
            'cmdb-dashboard-ci-chart-incident-states', 'CI Chart Incident States', ConfigurationType.Widget,
            'config-item-chart-widget', 'Translatable#Number of Config Items in critical incident state', [],
            new ConfigurationDefinition('cmdb-dashboard-ci-incident-state-chart-widget', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chart3);

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const deploymentStates = await CMDBService.getInstance().getDeploymentStates(serverConfig.BACKEND_API_TOKEN);
        const filter: KIXObjectPropertyFilter[] = [];
        deploymentStates.forEach(
            (ds) => filter.push(new KIXObjectPropertyFilter(ds.Name, [
                new TableFilterCriteria(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.EQUALS, ds.ItemID
                )
            ])));


        const tableWidgetConfig = new TableWidgetConfiguration(
            'cmdb-dashboard-ci-table-widget', 'CI Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM, null, null, null, null, true, null, filter
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableWidgetConfig);

        const ciListWidget = new WidgetConfiguration(
            'cmdb-dashboard-ci-list-widget', 'CI List', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Config Items',
            ['ticket-create-action', 'config-item-create-action', 'csv-export-action'],
            new ConfigurationDefinition('cmdb-dashboard-ci-table-widget', ConfigurationType.TableWidget),
            null, false, false, 'kix-icon-ci', true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(ciListWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('cmdb-dashboard-notes-widget', 'cmdb-dashboard-notes-widget')
            ],
            [
                new ConfiguredWidget(
                    'cmdb-dashboard-class-explorer', 'cmdb-dashboard-class-explorer', null,
                    [new UIComponentPermission('system/cmdb/classes', [CRUD.READ])]
                )
            ],
            [],
            [
                new ConfiguredWidget(
                    'cmdb-dashboard-ci-chart-items-count', 'cmdb-dashboard-ci-chart-items-count', null,
                    [new UIComponentPermission('cmdb/configitems', [CRUD.READ])], WidgetSize.SMALL
                ),
                new ConfiguredWidget(
                    'cmdb-dashboard-ci-chart-deployment-states', 'cmdb-dashboard-ci-chart-deployment-states', null,
                    [new UIComponentPermission('cmdb/configitems', [CRUD.READ])], WidgetSize.SMALL
                ),
                new ConfiguredWidget(
                    'cmdb-dashboard-ci-chart-incident-states', 'cmdb-dashboard-ci-chart-incident-states', null,
                    [new UIComponentPermission('cmdb/configitems', [CRUD.READ])], WidgetSize.SMALL
                ),
                new ConfiguredWidget(
                    'cmdb-dashboard-ci-list-widget', 'cmdb-dashboard-ci-list-widget', null,
                    [new UIComponentPermission('cmdb/configitems', [CRUD.READ])], WidgetSize.LARGE
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const linkFormId = 'cmdb-config-item-link-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-class',
                'Translatable#Config Item Class', ConfigItemProperty.CLASS_ID,
                'object-reference-input', false, 'Translatable#Helptext_CMDB_ConfigItem_Link_Class',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.CONFIG_ITEM_CLASS),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-name',
                'Translatable#Name', ConfigItemProperty.NAME, null, false,
                'Translatable#Helptext_CMDB_ConfigItem_Link_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-number',
                'Translatable#Number', ConfigItemProperty.NUMBER, null, false,
                'Translatable#Helptext_CMDB_ConfigItem_Link_Number'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-deployment-state',
                'Translatable#Deployment State', VersionProperty.CUR_DEPL_STATE_ID, 'object-reference-input',
                false, 'Translatable#Helptext_CMDB_ConfigItem_Link_DeploymentState',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            ),
                            new FilterCriteria(
                                GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, 'ITSM::ConfigItem::DeploymentState'
                            )
                        ])
                    )
                ],
                null, null, null, null, 1, 1, 1, null, null, null, false, false
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-incident-state',
                'Translatable#Incident State', VersionProperty.CUR_INCI_STATE_ID, 'object-reference-input',
                false, 'Translatable#Helptext_CMDB_ConfigItem_Link_IncidentState',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            ),
                            new FilterCriteria(
                                GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, 'ITSM::Core::IncidentState'
                            )
                        ])
                    )
                ],
                null, null, null, null, 1, 1, 1, null, null, null, false, false
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'cmdb-config-item-link-form-group-data',
                'Translatable#Config Item Data',
                [
                    'cmdb-config-item-link-form-field-class',
                    'cmdb-config-item-link-form-field-name',
                    'cmdb-config-item-link-form-field-number',
                    'cmdb-config-item-link-form-field-deployment-state',
                    'cmdb-config-item-link-form-field-incident-state',
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                linkFormId, 'Translatable#Link Config Item with',
                [
                    'cmdb-config-item-link-form-group-data'
                ],
                KIXObjectType.CONFIG_ITEM, false, FormContext.LINK
            )
        );

        ConfigurationService.getInstance().registerForm(
            [FormContext.LINK], KIXObjectType.CONFIG_ITEM, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
