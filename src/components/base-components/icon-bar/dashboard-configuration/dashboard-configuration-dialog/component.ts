import { TranslationHandler } from '@kix/core/dist/model/client';

class DashboardConfigurationDialog {

    private state: any;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = {
            explorerList: [
                {
                    instanceId: '20171114000011', title: 'Queues',
                    required: true, show: true
                },
                {
                    instanceId: '20171114000012', title: 'Service',
                    required: false, show: true
                }
            ],
            explorerActions: [
                { id: 'show', title: 'Anzeigen', type: 'checkbox' }
            ],
            contentFirstList: [
                {                       // TODO: oder fixedConf?
                    id: 'chart-widget', preConf: 'oneMonth', title: '1 Monat Statistik',
                    required: false, size: 's'
                },
                {
                    id: 'search-template-widget', title: 'Suchvorlage',
                    required: false, size: 's'
                },
                {                             // TODO: oder fixedConf?
                    id: 'ticket-list-widget', preConf: 'escalation', title: 'Eskalierte Tickets',
                    required: false, size: 'l'
                },
                {
                    id: 'ticket-list-widget', title: 'Liste',
                    required: false, size: 'l'
                },
                {
                    id: 'chart-widget', title: 'Diagramm',
                    required: false, size: 's'
                },
                {                             // TODO: oder fixedConf?
                    id: 'ticket-list-widget', preConf: 'place1', title: 'Platzhalter 1',
                    required: true, size: 's'
                },
                {                             // TODO: oder fixedConf?
                    id: 'ticket-list-widget', preConf: 'place2', title: 'Platzhalter 2',
                    required: true, size: 's'
                }
            ],
            contentSecondList: [
                {
                    instanceId: '20171114000001', id: 'admin-info-widget', title: 'Admininfos',
                    required: true, show: true, size: 's'
                },
                {                                                     // TODO: oder fixedConf?
                    instanceId: '20171114000002', id: 'chart-widget', preConf: 'sevenDay',
                    title: '7 Tage Statistik', required: false, show: true, size: 's'
                },
                {
                    instanceId: '20171114000003', id: 'chart-widget', title: 'Tortendiagramm - Meine To Dos',
                    required: false, show: true, size: 's'
                },
                {
                    instanceId: '20171114000004', id: 'chart-widget', title: 'Flächendiagramm',
                    required: false, show: false, size: 's'
                },
                {                                                           // TODO: oder fixedConf?
                    instanceId: '20171114000005', id: 'ticket-list-widget', preConf: 'place1',
                    title: 'Platzhalter 1 Blub', required: false, show: false, size: 'l'
                },
                {                                                           // TODO: oder fixedConf?
                    instanceId: '20171114000006', id: 'ticket-list-widget', preConf: 'place2',
                    title: 'Platzhalter 2 Bla', required: false, show: false, size: 'l'
                }
            ],
            contentActions: [
                { id: 'show', title: 'Anzeigen', type: 'checkbox' },
                { id: 'size', title: 'Größen', type: 'radio', values: ['s', 'l'] }
            ],
            sidebarFirstList: [
                {
                    id: 'customer-info-widget', title: 'Kunden',
                    required: false
                }
            ],
            sidebarSecondList: [
                {
                    instanceId: '20171114000021', title: 'Notizen',
                    required: true, show: true
                }
            ],
            sidebarActions: [
                { id: 'show', title: 'Anzeigen', type: 'checkbox' }
            ]
        };
    }

    public async onMount(input: any): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        // this.state.translations = translationHandler.getTranslations([]);
    }

    // private getTranslation(id: ConfigurationWidgetTranslationId): string {
    //     return (this.state.translations && this.state.translations[id]) ?
    // this.state.translations[id] : id.toString();
    // }
}

module.exports = DashboardConfigurationDialog;
