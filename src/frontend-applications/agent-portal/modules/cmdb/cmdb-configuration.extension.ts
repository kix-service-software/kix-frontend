/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { CMDBContext } from './webapp/core/context/CMDBContext';
import { ConfigItemChartWidgetConfiguration } from './webapp/core/charts/ConfigItemChartWidgetConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ChartComponentConfiguration } from '../report-charts/model/ChartComponentConfiguration';
import { ConfigItemProperty } from './model/ConfigItemProperty';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObjectPropertyFilter } from '../../model/KIXObjectPropertyFilter';
import { UIFilterCriterion } from '../../model/UIFilterCriterion';
import { SearchOperator } from '../search/model/SearchOperator';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { VersionProperty } from './model/VersionProperty';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { GeneralCatalogItemProperty } from '../general-catalog/model/GeneralCatalogItemProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { CMDBAPIService } from './server/CMDBService';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const classExplorer = new WidgetConfiguration(
            'cmdb-dashboard-class-explorer', 'Class Explorer', ConfigurationType.Widget,
            'config-item-class-explorer', 'Translatable#CMDB Explorer', [], null, null, false, false
        );
        configurations.push(classExplorer);

        const chartConfig1 = new ChartComponentConfiguration(
            'cmdb-dashboard-ci-chart-class-items-count', 'Class Items Count Chart', ConfigurationType.Chart,
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        backgroundColor: [
                            'rgb(91, 91, 91)',
                            'rgb(4, 83, 125)',
                            'rgb(0, 141, 210)',
                            'rgb(129, 189, 223)',
                            'rgb(160, 230, 200)',
                            'rgb(130, 200, 38)',
                            'rgb(0, 152, 70)',
                            'rgb(227, 30, 36)',
                            'rgb(239, 127, 26)',
                            'rgb(254, 204, 0)'
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
        configurations.push(chartConfig1);

        const chartWidgetConfig1 = new ConfigItemChartWidgetConfiguration(
            'cmdb-dashboard-ci-chart-class-items-count-widget', null, ConfigurationType.ChartWidget,
            ConfigItemProperty.CLASS_ID,
            new ConfigurationDefinition('cmdb-dashboard-ci-chart-class-items-count', ConfigurationType.Chart)
        );
        configurations.push(chartWidgetConfig1);

        const chart1 = new WidgetConfiguration(
            'cmdb-dashboard-ci-chart-items-count', 'Items Count', ConfigurationType.Widget,
            'config-item-chart-widget', 'Translatable#Number of Config Items', [],
            new ConfigurationDefinition(
                'cmdb-dashboard-ci-chart-class-items-count-widget', ConfigurationType.ChartWidget
            ),
            null, false, true, null, true
        );
        configurations.push(chart1);

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
                            'rgb(91, 91, 91)',
                            'rgb(4, 83, 125)',
                            'rgb(0, 141, 210)',
                            'rgb(129, 189, 223)',
                            'rgb(160, 230, 200)',
                            'rgb(130, 200, 38)',
                            'rgb(0, 152, 70)',
                            'rgb(227, 30, 36)',
                            'rgb(239, 127, 26)',
                            'rgb(254, 204, 0)'
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
        configurations.push(chartConfig2);

        const chartWidgetConfig2 = new ConfigItemChartWidgetConfiguration(
            'cmdb-dashboard-ci-deployment-state-chart-widget', 'CI Deployment States Chart Widget',
            ConfigurationType.ChartWidget,
            ConfigItemProperty.CUR_DEPL_STATE_ID,
            new ConfigurationDefinition('cmdb-dashboard-ci-deployment-state-chart', ConfigurationType.Chart)
        );
        configurations.push(chartWidgetConfig2);

        const chart2 = new WidgetConfiguration(
            'cmdb-dashboard-ci-chart-deployment-states', 'CI Chart Deployment States', ConfigurationType.Widget,
            'config-item-chart-widget', 'Translatable#Overview Config Items Deployment State', [],
            new ConfigurationDefinition(
                'cmdb-dashboard-ci-deployment-state-chart-widget', ConfigurationType.ChartWidget
            ),
            null, false, true, null, true
        );
        configurations.push(chart2);

        const chartConfig3 = new ChartComponentConfiguration(
            'cmdb-dashboard-ci-incident-state-chart', 'CI Incident States', ConfigurationType.Chart,
            {
                type: 'bar',
                data: {
                    datasets: [{
                        backgroundColor: [
                            'rgb(91, 91, 91)',
                            'rgb(4, 83, 125)',
                            'rgb(0, 141, 210)',
                            'rgb(129, 189, 223)',
                            'rgb(160, 230, 200)',
                            'rgb(130, 200, 38)',
                            'rgb(0, 152, 70)',
                            'rgb(227, 30, 36)',
                            'rgb(239, 127, 26)',
                            'rgb(254, 204, 0)'
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
        configurations.push(chartConfig3);

        const chartWidgetConfig3 = new ConfigItemChartWidgetConfiguration(
            'cmdb-dashboard-ci-incident-state-chart-widget', 'CI Incident States Chart Widget',
            ConfigurationType.ChartWidget,
            ConfigItemProperty.CUR_INCI_STATE_ID,
            new ConfigurationDefinition('cmdb-dashboard-ci-incident-state-chart', ConfigurationType.Chart)
        );
        configurations.push(chartWidgetConfig3);

        const chart3 = new WidgetConfiguration(
            'cmdb-dashboard-ci-chart-incident-states', 'CI Chart Incident States', ConfigurationType.Widget,
            'config-item-chart-widget', 'Translatable#Number of Config Items in critical incident state', [],
            new ConfigurationDefinition('cmdb-dashboard-ci-incident-state-chart-widget', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        configurations.push(chart3);

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const deploymentStates = await CMDBAPIService.getInstance().getDeploymentStates(serverConfig.BACKEND_API_TOKEN);
        const filter: KIXObjectPropertyFilter[] = [];
        deploymentStates.forEach(
            (ds) => filter.push(new KIXObjectPropertyFilter(ds.Name, [
                new UIFilterCriterion(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.EQUALS, ds.ItemID
                )
            ])));

        const tableWidgetConfig = new TableWidgetConfiguration(
            'cmdb-dashboard-ci-table-widget', 'CI Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM, null, null, null, null, false, null, filter
        );
        configurations.push(tableWidgetConfig);

        const ciListWidget = new WidgetConfiguration(
            'cmdb-dashboard-ci-list-widget', 'CI List', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Config Items',
            ['bulk-action', 'csv-export-action'],
            new ConfigurationDefinition('cmdb-dashboard-ci-table-widget', ConfigurationType.TableWidget),
            null, false, false, 'kix-icon-ci', true
        );
        configurations.push(ciListWidget);

        const contextConfig = new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [],
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
        contextConfig.tableWidgetInstanceIds = [[KIXObjectType.CONFIG_ITEM, 'cmdb-dashboard-ci-list-widget']];
        configurations.push(contextConfig);

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const linkFormId = 'cmdb-config-item-link-form';
        configurations.push(
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
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-name',
                'Translatable#Name', ConfigItemProperty.NAME, null, false,
                'Translatable#Helptext_CMDB_ConfigItem_Link_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-link-form-field-number',
                'Translatable#Number', ConfigItemProperty.NUMBER, null, false,
                'Translatable#Helptext_CMDB_ConfigItem_Link_Number'
            )
        );
        configurations.push(
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
        configurations.push(
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

        configurations.push(
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

        configurations.push(
            new FormPageConfiguration(
                'cmdb-config-item-link-form-page', 'Translatable#Link Config Item with',
                ['cmdb-config-item-link-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                linkFormId, 'Translatable#Link Config Item with',
                ['cmdb-config-item-link-form-page'],
                KIXObjectType.CONFIG_ITEM, false, FormContext.LINK
            )
        );

        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.LINK], KIXObjectType.CONFIG_ITEM, linkFormId
        );

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
