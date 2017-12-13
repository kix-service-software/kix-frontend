import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ConfiguredWidget, WidgetSize } from '@kix/core/dist/model/';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "tickets";
    }

    public getDefaultConfiguration(): any {
        const explorerRows: string[][] = [
            [
                '20171211155412'
            ]
        ];

        const explorerConfiguredWidgets: ConfiguredWidget[] = [
            {
                instanceId: '20171211155412',
                configuration: {
                    widgetId: 'queue-explorer-widget',
                    title: "Queues",
                    actions: [],
                    settings: {},
                    show: true,
                    size: WidgetSize.SMALL,
                    icon: 'note'
                },
            }
        ];

        return {
            contentRows: [], sidebarRows: [], explorerRows,
            contentConfiguredWidgets: [], sidebarConfiguredWidgets: [], explorerConfiguredWidgets
        };
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
