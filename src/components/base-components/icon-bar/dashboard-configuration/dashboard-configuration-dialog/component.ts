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
        const widgetDescriptorList: WidgetDescriptor[] = DashboardStore.getInstance().getAvailableWidgets();
        const dashboardConfig: DashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
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
            contentSecondList: [
                {
                    instanceId: '20171114000001', widgetId: 'admin-info-widget', label: 'Admininfos',
                    required: true, show: true, size: 's', id: 'admin-info-widget-1'
                },
                {                                                           // TODO: oder fixedConf?
                    instanceId: '20171114000002', widgetId: 'chart-widget', preConf: 'sevenDay',
                    label: '7 Tage Statistik', required: false, show: true, size: 's', id: 'chart-widget-3'
                },
                {
                    instanceId: '20171114000003', widgetId: 'chart-widget', label: 'Tortendiagramm - Meine To Dos',
                    required: false, show: true, size: 's', id: 'chart-widget-4'
                },
                {
                    instanceId: '20171114000004', widgetId: 'chart-widget', label: 'Flächendiagramm',
                    required: false, show: false, size: 's', id: 'chart-widget-5'
                },
                {                                                                 // TODO: oder fixedConf?
                    instanceId: '20171114000005', widgetId: 'ticket-list-widget', preConf: 'place1',
                    label: 'Platzhalter 1 Blub', required: false, show: false, size: 'l', id: 'ticket-list-widget-5'
                },
                {                                                                 // TODO: oder fixedConf?
                    instanceId: '20171114000006', widgetId: 'ticket-list-widget', preConf: 'place2',
                    label: 'Platzhalter 2 Bla', required: false, show: false, size: 'l', id: 'ticket-list-widget-6'
                }
            ],
            contentProperties: [
                { id: 'show', label: 'Anzeigen', type: 'checkbox' },
                {
                    id: 'size', label: 'Größen', type: 'radio',
                    values: [{ id: WidgetSize.SMALL, label: 's' }, { id: WidgetSize.LARGE, label: 'l' }]
                }
            ],
            sidebarFirstList: [],
            sidebarSecondList: [
                {
                    instanceId: '20171114000021', widgetId: 'notes-widget', label: 'Notizen',
                    required: true, show: true, id: 'notes-widget-1'
                }
            ],
        };

        widgetDescriptorList.forEach((wd, index) => {
            if (wd.required) {
                // TODO: muss in secondList sein, braucht nicht in firstList
            }
            const listElement = {
                id: wd.widgetId + Date.now().toString(),
                label: wd.configuration.title,
                properties: {
                    show: wd.configuration.show,
                    size: wd.configuration.size
                }
            };
            if (wd.isContentWidget) {
                this.state.contentFirstList.push(listElement);
            }
            if (wd.isSidebarWidget) {
                this.state.sidebarFirstList.push(listElement);
            }
        });

        // const widgetConfigs = {};
        // dashboardConfig.configuredWidgets.forEach((wc) => {
        //     widgetConfigs[wc[0]] = wc[1];
        // });
        // dashboardConfig.rows.forEach((row, index) => {
        //     row.forEach((widget) => {
        //         if (widgetConfigs[widget.instanceId]) {
        //             const listElement = {
        //                 id: widget.id + Date.now().toString(),
        //                 label: widgetConfigs[widget.instanceId].title,
        //                 properties: {
        //                     show: widgetConfigs[widget.instanceId].show,
        //                     size: widgetConfigs[widget.instanceId].size
        //                 }
        //             };
        //         }

        //     });
        //     // if (wc.isContentWidget) {
        //     //     this.state.contentFirstList.push(listElement);
        //     // }
        //     // if (wc.isSidebarWidget) {
        //     //     this.state.sidebarFirstList.push(listElement);
        //     // }
        // });
        const translationHandler = await TranslationHandler.getInstance();
        // this.state.translations = translationHandler.getTranslations([]);
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
