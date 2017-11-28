import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/dashboard/';
    }

    public getModuleId(): string {
        return "dashboard";
    }

    public getDefaultConfiguration(): any {

        // TODO: aus einer config auslesen, oder wirklich DashboardConfiguration zurückgeben
        const rows: string[][] = [
            [
                '20170920072542',
                '20170920084512',
                '20170920113214',
            ],
            ['20170920101621'],
            ['20170920093015']
        ];
        const configuredWidgets: Array<[string, WidgetConfiguration]> = [
            [
                '20170920072542',
                {
                    widgetId: 'chart-widget',
                    title: 'Chart',
                    actions: [],
                    settings: {
                        chartType: 'bar'
                    },
                    show: true,
                    size: WidgetSize.SMALL
                }
            ],
            [
                '20170920084512',
                {
                    widgetId: 'chart-widget',
                    title: 'Chart 2',
                    actions: [],
                    settings: {
                        chartType: 'pie'
                    },
                    show: true,
                    size: WidgetSize.SMALL
                }
            ],
            [
                '20170920113214',
                {
                    widgetId: 'search-templates-widget',
                    title: 'Suchvorlagen',
                    actions: [],
                    settings: {},
                    show: true,
                    size: WidgetSize.SMALL
                },
            ],
            [
                '20170920101621',
                {
                    widgetId: 'ticket-list-widget',
                    title: 'Ticket-Liste',
                    actions: [],
                    settings: {
                        limit: 10,
                        showTotalCount: true,
                        properties: [
                            'TicketNumber',
                            'PriorityID',
                            'StateID',
                            'TypeID',
                            'Title',
                            'Created',
                            'Age'
                        ]
                    },
                    show: true,
                    size: WidgetSize.LARGE
                },
            ],
            [
                '20170920093015',
                {
                    widgetId: 'user-list-widget',
                    title: 'User-List',
                    actions: [],
                    settings: {
                        properties: [
                            {
                                name: 'UserID',
                                displayName: 'ID'
                            },
                            {
                                name: 'UserFirstname',
                                displayName: 'Vorname'
                            },
                            {
                                name: 'UserLastname',
                                displayName: 'Nachname'
                            },
                            {
                                name: 'UserEmail',
                                displayName: 'Email'
                            }
                        ],
                        limit: 10
                    },
                    show: true,
                    size: WidgetSize.LARGE
                }
            ]
        ];

        return { rows, configuredWidgets };
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
