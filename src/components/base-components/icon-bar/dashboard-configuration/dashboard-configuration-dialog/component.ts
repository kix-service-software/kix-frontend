import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { DashboardConfiguration, WidgetDescriptor, WidgetSize } from '@kix/core/dist/model';

class DashboardConfigurationDialog {

    private state: any;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public async onMount(): Promise<void> {
        // console.log(widgetDescriptorList);
        // console.log(dashboardConfig);
        this.state = {
            // TODO: nur Beispiel
            explorerList: [
                {
                    instanceId: '20171114000011', widgetId: 'explorer-widget', label: 'Queues',
                    required: true, show: true, id: 'explorer-widget-1'
                },
                {
                    instanceId: '20171114000012', widgetId: 'explorer-widget', label: 'Service',
                    required: false, show: true, id: 'explorer-widget-2'
                }
            ],
            explorerProperties: [
                { id: 'show', label: 'Anzeigen', type: 'checkbox' }
            ],
            contentFirstList: [],
            contentSecondList: [],
            contentProperties: [
                { id: 'show', label: 'Anzeigen', type: 'checkbox' },
                {
                    id: 'size', label: 'Größen', type: 'radio',
                    values: [{ id: WidgetSize.SMALL, label: 's' }, { id: WidgetSize.LARGE, label: 'l' }]
                }
            ],
            sidebarFirstList: [],
            sidebarSecondList: [],
        };

        this.prepareFirstLists();
        this.prepareSecondLists();
        this.state.contentFirstList = this.state.contentFirstList.sort(this.sortList);
        this.state.sidebarFirstList = this.state.sidebarFirstList.sort(this.sortList);
        this.state.contentSecondList = this.state.contentSecondList.sort(this.sortList);
        this.state.sidebarSecondList = this.state.sidebarSecondList.sort(this.sortList);

        const translationHandler = await TranslationHandler.getInstance();
        // this.state.translations = translationHandler.getTranslations([]);
    }

    private prepareFirstLists() {
        const widgetDescriptorList: WidgetDescriptor[] = DashboardStore.getInstance().getAvailableWidgets();
        widgetDescriptorList.forEach((wd, index) => {
            const listElement = {
                id: wd.widgetId + Date.now().toString(),
                label: wd.configuration.title,
                properties: {
                    show: wd.configuration.show,
                    size: wd.configuration.size
                }
            };
            if (wd.isContentWidget) {
                if (wd.required) {
                    this.state.contentSecondList.push(listElement);
                } else {
                    this.state.contentFirstList.push(listElement);
                }
            }
            if (wd.isSidebarWidget) {
                if (wd.required) {
                    this.state.sidebarSecondList.push(listElement);
                } else {
                    this.state.sidebarFirstList.push(listElement);
                }
            }
        });
    }

    private prepareSecondLists() {
        const dashboardConfig: DashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
        let instanceIds = [];
        dashboardConfig.rows.forEach((row) => {
            instanceIds = [...instanceIds, ...row];
        });

        dashboardConfig.configuredContentWidgets.forEach((widgetTuple) => {
            const listElement = {
                id: widgetTuple[1].widgetId + Date.now().toString(),
                label: widgetTuple[1].title,
                properties: {
                    show: instanceIds.some((wiId) => wiId === widgetTuple[0]),
                    size: widgetTuple[1].size
                }
            };
            this.state.contentSecondList.push(listElement);
        });

        dashboardConfig.configuredSidebarWidgets.forEach((widgetTuple) => {
            const listElement = {
                id: widgetTuple[1].widgetId + Date.now().toString(),
                label: widgetTuple[1].title,
                properties: {
                    show: instanceIds.some((wiId) => wiId === widgetTuple[0]),
                    size: widgetTuple[1].size
                }
            };
            this.state.sidebarSecondList.push(listElement);
        });
    }

    private sortList(a, b) {
        const labelA = a.label.toUpperCase();
        const labelB = b.label.toUpperCase();
        let result: number = 0;
        if (labelA < labelB) {
            result = -1;
        }
        if (labelA > labelB) {
            result = 1;
        }
        return result;
    }
    // private getTranslation(id: ConfigurationWidgetTranslationId): string {
    //     return (this.state.translations && this.state.translations[id]) ?
    // this.state.translations[id] : id.toString();
    // }
}

module.exports = DashboardConfigurationDialog;


// this.state = {
//     // TODO: nur Beispiel
//     explorerList: [
//         {
//             instanceId: '20171114000011', widgetId: 'explorer-widget', title: 'Queues',
//             required: true, show: true, id: 'explorer-widget-1'
//         },
//         {
//             instanceId: '20171114000012', widgetId: 'explorer-widget', title: 'Service',
//             required: false, show: true, id: 'explorer-widget-2'
//         }
//     ],
//     explorerProperties: [
//         { id: 'show', label: 'Anzeigen', type: 'checkbox' }
//     ],
//     contentFirstList: [
//         {                             // TODO: oder fixedConf?
//             widgetId: 'chart-widget', preConf: 'oneMonth', title: '1 Monat Statistik',
//             required: false, size: 's', id: 'chart-widget-1'
//         },
//         {
//             widgetId: 'search-template-widget', title: 'Suchvorlage',
//             required: false, size: 's', id: 'search-template-widget-1'
//         },
//         {                                   // TODO: oder fixedConf?
//             widgetId: 'ticket-list-widget', preConf: 'escalation', title: 'Eskalierte Tickets',
//             required: false, size: 'l', id: 'ticket-list-widget-1'
//         },
//         {
//             widgetId: 'ticket-list-widget', title: 'Liste',
//             required: false, size: 'l', id: 'ticket-list-widget-2'
//         },
//         {
//             widgetId: 'chart-widget', title: 'Diagramm',
//             required: false, size: 's', id: 'chart-widget-2'
//         },
//         {                                   // TODO: oder fixedConf?
//             widgetId: 'ticket-list-widget', preConf: 'place1', title: 'Platzhalter 1',
//             required: true, size: 's', id: 'ticket-list-widget-3'
//         },
//         {                                   // TODO: oder fixedConf?
//             widgetId: 'ticket-list-widget', preConf: 'place2', title: 'Platzhalter 2',
//             required: true, size: 's', id: 'ticket-list-widget-4'
//         }
//     ],
//     contentSecondList: [
//         {
//             instanceId: '20171114000001', widgetId: 'admin-info-widget', title: 'Admininfos',
//             required: true, show: true, size: 's', id: 'admin-info-widget-1'
//         },
//         {                                                           // TODO: oder fixedConf?
//             instanceId: '20171114000002', widgetId: 'chart-widget', preConf: 'sevenDay',
//             title: '7 Tage Statistik', required: false, show: true, size: 's', id: 'chart-widget-3'
//         },
//         {
//             instanceId: '20171114000003', widgetId: 'chart-widget', title: 'Tortendiagramm - Meine To Dos',
//             required: false, show: true, size: 's', id: 'chart-widget-4'
//         },
//         {
//             instanceId: '20171114000004', widgetId: 'chart-widget', title: 'Flächendiagramm',
//             required: false, show: false, size: 's', id: 'chart-widget-5'
//         },
//         {                                                                 // TODO: oder fixedConf?
//             instanceId: '20171114000005', widgetId: 'ticket-list-widget', preConf: 'place1',
//             title: 'Platzhalter 1 Blub', required: false, show: false, size: 'l', id: 'ticket-list-widget-5'
//         },
//         {                                                                 // TODO: oder fixedConf?
//             instanceId: '20171114000006', widgetId: 'ticket-list-widget', preConf: 'place2',
//             title: 'Platzhalter 2 Bla', required: false, show: false, size: 'l', id: 'ticket-list-widget-6'
//         }
//     ],
//     contentProperties: [
//         { id: 'show', label: 'Anzeigen', type: 'checkbox' },
//         {
//             id: 'size', label: 'Größen', type: 'radio',
//             values: [{ id: 's', label: 's' }, { id: 'l', label: 'l' }]
//         }
//     ],
//     sidebarFirstList: [
//         {
//             widgetId: 'customer-info-widget', title: 'Kunden',
//             required: false, id: 'customer-info-widget-1'
//         }
//     ],
//     sidebarSecondList: [
//         {
//             instanceId: '20171114000021', widgetId: 'notes-widget', title: 'Notizen',
//             required: true, show: true, id: 'notes-widget-1'
//         }
//     ],
//     sidebarProperties: [
//         { id: 'show', label: 'Anzeigen', type: 'checkbox' }
//     ]
// };
