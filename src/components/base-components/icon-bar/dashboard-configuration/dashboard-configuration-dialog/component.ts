import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ConfiguredWidget, DashboardConfiguration, WidgetDescriptor, WidgetSize } from '@kix/core/dist/model';

class DashboardConfigurationDialog {

    private state: any;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public async onMount(): Promise<void> {
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

        this.buildList(
            dashboardConfig.contentRows,
            dashboardConfig.contentConfiguredWidgets,
            this.state.contentSecondList
        );
        this.buildList(
            dashboardConfig.sidebarRows,
            dashboardConfig.sidebarConfiguredWidgets,
            this.state.sidebarSecondList
        );
    }

    private buildList(rows: string[][], configuredWidgets: ConfiguredWidget[], targetList: any[]) {
        let instanceIds = [];
        rows.forEach((row) => {
            instanceIds = [...instanceIds, ...row];
        });
        configuredWidgets.forEach((configuredWidget: ConfiguredWidget) => {
            const listElement = {
                id: configuredWidget.configuration.widgetId + Date.now().toString(),
                label: configuredWidget.configuration.title,
                properties: {
                    show: instanceIds.some((wiId) => wiId === configuredWidget.instanceId),
                    size: configuredWidget.configuration.size
                }
            };
            targetList.push(listElement);
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
