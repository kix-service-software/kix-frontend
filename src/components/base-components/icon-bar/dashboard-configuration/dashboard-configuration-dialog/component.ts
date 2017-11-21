import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class DashboardConfigurationDialog {

    private state: any;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public async onMount(): Promise<void> {
        const widgetList = DashboardStore.getInstance().getWidgetList();
        console.log(widgetList);
        const translationHandler = await TranslationHandler.getInstance();
        // this.state.translations = translationHandler.getTranslations([]);
        this.state = {
            explorerList: [
                {
                    instanceId: '20171114000011', widgetId: 'explorer-widget', title: 'Queues',
                    required: true, show: true, id: 'explorer-widget-1'
                },
                {
                    instanceId: '20171114000012', widgetId: 'explorer-widget', title: 'Service',
                    required: false, show: true, id: 'explorer-widget-2'
                }
            ],
            explorerProperties: [
                { id: 'show', label: 'Anzeigen', type: 'checkbox' }
            ],
            contentFirstList: [
                {                             // TODO: oder fixedConf?
                    widgetId: 'chart-widget', preConf: 'oneMonth', title: '1 Monat Statistik',
                    required: false, size: 's', id: 'chart-widget-1'
                },
                {
                    widgetId: 'search-template-widget', title: 'Suchvorlage',
                    required: false, size: 's', id: 'search-template-widget-1'
                },
                {                                   // TODO: oder fixedConf?
                    widgetId: 'ticket-list-widget', preConf: 'escalation', title: 'Eskalierte Tickets',
                    required: false, size: 'l', id: 'ticket-list-widget-1'
                },
                {
                    widgetId: 'ticket-list-widget', title: 'Liste',
                    required: false, size: 'l', id: 'ticket-list-widget-2'
                },
                {
                    widgetId: 'chart-widget', title: 'Diagramm',
                    required: false, size: 's', id: 'chart-widget-2'
                },
                {                                   // TODO: oder fixedConf?
                    widgetId: 'ticket-list-widget', preConf: 'place1', title: 'Platzhalter 1',
                    required: true, size: 's', id: 'ticket-list-widget-3'
                },
                {                                   // TODO: oder fixedConf?
                    widgetId: 'ticket-list-widget', preConf: 'place2', title: 'Platzhalter 2',
                    required: true, size: 's', id: 'ticket-list-widget-4'
                }
            ],
            contentSecondList: [
                {
                    instanceId: '20171114000001', widgetId: 'admin-info-widget', title: 'Admininfos',
                    required: true, show: true, size: 's', id: 'admin-info-widget-1'
                },
                {                                                           // TODO: oder fixedConf?
                    instanceId: '20171114000002', widgetId: 'chart-widget', preConf: 'sevenDay',
                    title: '7 Tage Statistik', required: false, show: true, size: 's', id: 'chart-widget-3'
                },
                {
                    instanceId: '20171114000003', widgetId: 'chart-widget', title: 'Tortendiagramm - Meine To Dos',
                    required: false, show: true, size: 's', id: 'chart-widget-4'
                },
                {
                    instanceId: '20171114000004', widgetId: 'chart-widget', title: 'Flächendiagramm',
                    required: false, show: false, size: 's', id: 'chart-widget-5'
                },
                {                                                                 // TODO: oder fixedConf?
                    instanceId: '20171114000005', widgetId: 'ticket-list-widget', preConf: 'place1',
                    title: 'Platzhalter 1 Blub', required: false, show: false, size: 'l', id: 'ticket-list-widget-5'
                },
                {                                                                 // TODO: oder fixedConf?
                    instanceId: '20171114000006', widgetId: 'ticket-list-widget', preConf: 'place2',
                    title: 'Platzhalter 2 Bla', required: false, show: false, size: 'l', id: 'ticket-list-widget-6'
                }
            ],
            contentProperties: [
                { id: 'show', label: 'Anzeigen', type: 'checkbox' },
                {
                    id: 'size', label: 'Größen', type: 'radio',
                    values: [{ id: 's', label: 's' }, { id: 'l', label: 'l' }]
                }
            ],
            sidebarFirstList: [
                {
                    widgetId: 'customer-info-widget', title: 'Kunden',
                    required: false, id: 'customer-info-widget-1'
                }
            ],
            sidebarSecondList: [
                {
                    instanceId: '20171114000021', widgetId: 'notes-widget', title: 'Notizen',
                    required: true, show: true, id: 'notes-widget-1'
                }
            ],
            sidebarProperties: [
                { id: 'show', label: 'Anzeigen', type: 'checkbox' }
            ]
        };
    }

    // private getTranslation(id: ConfigurationWidgetTranslationId): string {
    //     return (this.state.translations && this.state.translations[id]) ?
    // this.state.translations[id] : id.toString();
    // }
}

module.exports = DashboardConfigurationDialog;
