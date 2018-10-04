import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, WidgetConfiguration, WidgetSize, ConfiguredWidget, ConfigItemProperty,
    FormField, VersionProperty, FormFieldOption, FormContext, KIXObjectType, Form
} from '@kix/core/dist/model';
import { CMDBContext, CMDBContextConfiguration, ConfigItemChartConfiguration } from '@kix/core/dist/browser/cmdb';
import { IConfigurationService } from '@kix/core/dist/services';
import { ServiceContainer } from '@kix/core/dist/common';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const sidebars = ['20180830-cmdb-notes-sidebar'];

        const notesSidebar = new ConfiguredWidget('20180830-cmdb-notes-sidebar',
            new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-note', false
            ));

        const sidebarWidgets = [notesSidebar];

        const explorer = ['20180830-ci-class-explorer'];

        const ciClassExplorer = new ConfiguredWidget('20180830-ci-class-explorer',
            new WidgetConfiguration(
                'config-item-class-explorer', 'CMDB Explorer', [], {}, false, false
            ));
        const explorerWidgets = [ciClassExplorer];


        // CONTENT WIDGETS

        const chartConfig1 = new ConfigItemChartConfiguration(ConfigItemProperty.CLASS_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
        const chart1 = new ConfiguredWidget('20180903-cmdb-chart-1', new WidgetConfiguration(
            'config-item-chart-widget', 'Anzahl Config Items', [], chartConfig1,
            false, true, WidgetSize.SMALL, null, true)
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
                        'rgba(255, 0, 0, 0.8)',
                        'rgba(255, 0, 0, 0.6)',
                        'rgba(255, 0, 0, 0.4)',
                        'rgba(255, 0, 0, 0.2)',
                        'rgba(0, 0, 255, 0.8)',
                        'rgba(0, 0, 255, 0.6)',
                        'rgba(0, 0, 255, 0.4)',
                        'rgba(0, 0, 255, 0.2)',
                        'rgba(0, 255, 0, 0.8)',
                        'rgba(0, 255, 0, 0.6)',
                        'rgba(0, 255, 0, 0.4)'
                    ]
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        padding: 2,
                        fontSize: 10
                    }
                }
            }
        });
        const chart2 = new ConfiguredWidget('20180903-cmdb-chart-2', new WidgetConfiguration(
            'config-item-chart-widget', 'Übersicht Config Items Verwendungsstatus', [], chartConfig2,
            false, true, WidgetSize.SMALL, null, true)
        );

        const chartConfig3 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_INCI_STATE_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
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
                        stacked: true
                    }]
                }
            }
        });
        const chart3 = new ConfiguredWidget('20180903-cmdb-chart-3', new WidgetConfiguration(
            'config-item-chart-widget', 'Übersicht Config Items Vorfallstatus', [], chartConfig3,
            false, true, WidgetSize.SMALL, null, true)
        );

        const content = [
            '20180903-cmdb-chart-1', '20180903-cmdb-chart-2', '20180903-cmdb-chart-3', '20180905-ci-list-widget'
        ];

        const ciListWidget = new ConfiguredWidget('20180905-ci-list-widget', new WidgetConfiguration(
            'config-item-list-widget', 'Übersicht Config Items', [
                'config-item-bulk-action', 'ticket-create-action', 'config-item-create-action', 'csv-export-action'
            ], {}, false, true,
            WidgetSize.LARGE, 'kix-icon-ci', true
        ));

        const contentWidgets = [chart1, chart2, chart3, ciListWidget];

        return new CMDBContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, content, contentWidgets
        );
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(): Promise<void> {
        const configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>(
            'IConfigurationService'
        );

        const linkFormId = 'link-config-item-search-form';
        const existingForm = configurationService.getModuleConfiguration(linkFormId, null);
        if (!existingForm) {
            const fields: FormField[] = [];
            fields.push(
                new FormField(
                    'Config Item Klasse', ConfigItemProperty.CLASS_ID,
                    'ci-class-input', false, 'Wählen Sie eine Config Item Klasse aus der Liste und suchen Sie nach Config Items innerhalb der gewählten Klasse.'
                )
            );
            fields.push(new FormField('Name', ConfigItemProperty.NAME, null, false, 'Geben Sie einen Config Item Name oder Teile eines Namens (mindestens 1 Zeichen) ein und suchen Sie nach Config Items mit diesem Name oder Teilen des Namens.'));
            fields.push(new FormField('Nummer', ConfigItemProperty.NUMBER, null, false, 'Geben Sie eine Config Item Nummer oder Teile einer Nummer (mindestens 1 Zeichen) ein und suchen Sie nach Config Items mit dieser Nummer oder Teilen der Nummer.'));
            fields.push(new FormField(
                'Verwendungsstatus', VersionProperty.CUR_DEPL_STATE_ID, 'general-catalog-input',
                false, 'Wählen Sie einen Verwendungsstatus aus der Liste und suchen Sie nach Config Items mit diesem Verwendungsstatus.',
                [new FormFieldOption('GC_CLASS', 'ITSM::ConfigItem::DeploymentState')],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));
            fields.push(new FormField(
                'Vorfallstatus', VersionProperty.CUR_INCI_STATE_ID, 'general-catalog-input',
                false, 'Wählen Sie einen Vorfallstatus aus der Liste und suchen Sie nach Config Items mit diesem Vorfallstatus.',
                [new FormFieldOption('GC_CLASS', 'ITSM::Core::IncidentState')],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));

            const group = new FormGroup('Config Item Daten', fields);

            const form = new Form(
                linkFormId, 'Verknüpfen mit Config Item', [group], KIXObjectType.CONFIG_ITEM, false, FormContext.LINK
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.CONFIG_ITEM, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
