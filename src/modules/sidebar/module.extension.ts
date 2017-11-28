import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { SidebarConfiguration, WidgetSize } from '@kix/core/dist/model';

export class SidebarFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "sidebar";
    }

    public getTemplate(): string {
        return "";
    }

    public getDefaultConfiguration(): any {
        const sidebarDefaultConfiguration: SidebarConfiguration = {
            rows: [
                ['20170915101514'],
                ['20170915094112'],
                ['20170915085411']
            ],
            configuredWidgets: [
                [
                    '20170915101514',
                    {
                        widgetId: 'notes-widget',
                        title: "Notes",
                        actions: [],
                        settings: {
                            notes: 'Test <strong style="color:red">123</strong>'
                        },
                        show: true,
                        size: WidgetSize.SMALL
                    },
                ],
                [
                    '20170915094112',
                    {
                        widgetId: 'notes-widget',
                        title: "Notes 2",
                        actions: [],
                        settings: {
                            notes: ""
                        },
                        show: true,
                        size: WidgetSize.SMALL
                    },
                ],
                [
                    '20170915085411',
                    {
                        widgetId: 'ticket-info-widget',
                        title: "Ticket-Info",
                        actions: [],
                        settings: {},
                        show: true,
                        size: WidgetSize.SMALL
                    }
                ]
            ]
        };
        return sidebarDefaultConfiguration;
    }
}

module.exports = (data, host, options) => {
    return new SidebarFactoryExtension();
};
