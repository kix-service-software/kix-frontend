import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, WidgetConfiguration, WidgetSize, ConfiguredWidget, ConfigItemProperty
} from '@kix/core/dist/model';
import { CMDBContext, CMDBContextConfiguration, ConfigItemChartConfiguration } from '@kix/core/dist/browser/cmdb';

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const sidebars = ['20180830-cmdb-notes-sidebar'];

        const notesSidebar = new ConfiguredWidget('20180830-cmdb-notes-sidebar',
            new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-notes', false
            ));

        const sidebarWidgets = [notesSidebar];

        const explorer = ['20180830-ci-class-explorer'];

        const ciClassExplorer = new ConfiguredWidget('20180830-ci-class-explorer',
            new WidgetConfiguration(
                'config-item-class-explorer', 'CMDB Klassen', [], {}, false, false
            ));
        const explorerWidgets = [ciClassExplorer];


        const content = ['20180903-cmdb-chart-1', '20180903-cmdb-chart-2', '20180903-cmdb-chart-3'];

        const chartConfig1 = new ConfigItemChartConfiguration(ConfigItemProperty.CLASS_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        });
        const chart1 = new ConfiguredWidget('20180903-cmdb-chart-1', new WidgetConfiguration(
            'config-item-chart-widget', 'Anzahl pro CI-Klasse', [], chartConfig1,
            false, true, WidgetSize.SMALL, null, true)
        );

        const chartConfig2 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_DEPL_STATE_ID, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    label: "",
                    data: [],
                    fill: true,
                    backgroundColor: [
                        "rgba(255, 0, 0, 0.8)",
                        "rgba(255, 0, 0, 0.6)",
                        "rgba(255, 0, 0, 0.4)",
                        "rgba(255, 0, 0, 0.2)",
                        "rgba(0, 0, 255, 0.8)",
                        "rgba(0, 0, 255, 0.6)",
                        "rgba(0, 0, 255, 0.4)",
                        "rgba(0, 0, 255, 0.2)",
                        "rgba(0, 255, 0, 0.8)",
                        "rgba(0, 255, 0, 0.6)",
                        "rgba(0, 255, 0, 0.4)"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
            'config-item-chart-widget', 'Anzahl pro Verwendungsstatus', [], chartConfig2,
            false, true, WidgetSize.SMALL, null, true)
        );

        const chartConfig3 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_INCI_STATE_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
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
            'config-item-chart-widget', 'Anzahl pro Vorfallstatus', [], chartConfig3,
            false, true, WidgetSize.SMALL, null, true)
        );

        const contentWidgets = [chart1, chart2, chart3];

        return new CMDBContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, content, contentWidgets
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
