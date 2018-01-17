import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, DashboardConfiguration, ConfiguredWidget, WidgetSize
} from '@kix/core/dist/model';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "home";
    }

    public getDefaultConfiguration(): DashboardConfiguration {

        const chart1 =
            new ConfiguredWidget("20170920072542", new WidgetConfiguration(
                "chart-widget", "Chart", [], {
                    chartType: 'bar',
                    templateId: 'home-dashboard-priorities',
                    attributes: ['PriorityID'],
                    showLegend: true,
                    showAxes: true,
                    showValues: true
                },
                WidgetType.CONTENT, true, WidgetSize.SMALL, null, true)
            );
        const chart2 =
            new ConfiguredWidget("20170920084512", new WidgetConfiguration(
                "chart-widget", "Chart 2", [], {
                    chartType: 'pie',
                    templateId: 'home-dashboard-states',
                    attributes: ['StateID'],
                    showLegend: true,
                    showAxes: true,
                    showValues: true
                },
                WidgetType.CONTENT, true, WidgetSize.SMALL, null, true)
            );
        const searchTemplateWidget =
            new ConfiguredWidget("20170920113214", new WidgetConfiguration(
                "search-templates-widget", "Suchvorlagen", [], {
                    widgetId: '',
                    title: '',
                    actions: [],
                    settings: {},
                    show: true,
                    size: WidgetSize.SMALL,
                    icon: null,
                    contextDependent: false
                },
                WidgetType.CONTENT, true, WidgetSize.SMALL, null, true)
            );

        const ticketListWidget =
            new ConfiguredWidget("20170920101621", new WidgetConfiguration(
                "ticket-list-widget", "Ticket-Liste", [], {
                    limit: 10,
                    displayLimit: 10,
                    showTotalCount: true,
                    properties: ['TicketNumber', 'PriorityID', 'StateID', 'TypeID', 'Title', 'Created', 'Age']
                },
                WidgetType.CONTENT, true, WidgetSize.SMALL, null, true)
            );

        const userListWidget =
            new ConfiguredWidget("20170920093015", new WidgetConfiguration(
                "user-list-widget", "User-List", [], {
                    properties: [
                        { name: 'UserID', displayName: 'ID' },
                        { name: 'UserFirstname', displayName: 'Vorname' },
                        { name: 'UserLastname', displayName: 'Nachname' },
                        { name: 'UserEmail', displayName: 'Email' }
                    ],
                    limit: 10
                },
                WidgetType.CONTENT, true, WidgetSize.SMALL, null, true)
            );

        // TODO: aus einer config auslesen, oder wirklich DashboardConfiguration zurückgeben
        const contentRows: string[][] = [
            ['20170920072542', '20170920084512', '20170920113214'], ['20170920101621'], ['20170920093015']
        ];
        const contentConfiguredWidgets: ConfiguredWidget[] =
            [chart1, chart2, searchTemplateWidget, ticketListWidget, userListWidget];


        const notes =
            new ConfiguredWidget("20170915101514", new WidgetConfiguration(
                "notes-widget", "Notes", [], {
                    notes: 'Test <strong style="color:red">123</strong>'
                },
                WidgetType.SIDEBAR, true, WidgetSize.SMALL, 'note', false)
            );
        const notes2 =
            new ConfiguredWidget("20170915094112", new WidgetConfiguration(
                "notes-widget", "Notes 2", [], { notes: '' }, WidgetType.SIDEBAR, true, WidgetSize.SMALL, 'note', false)
            );
        const sidebarRows: string[][] = [['20170915101514'], ['20170915094112'], ['20170915085411']];
        const sidebarConfiguredWidgets: ConfiguredWidget[] = [notes, notes2];

        return new DashboardConfiguration(
            this.getModuleId(), contentRows, sidebarRows, [],
            contentConfiguredWidgets, sidebarConfiguredWidgets, [], []
        );
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
