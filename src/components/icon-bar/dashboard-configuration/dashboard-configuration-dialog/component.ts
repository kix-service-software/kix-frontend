import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import {
    SelectWithFilterListElement,
    SelectWithPropertiesListElement,
    SelectWithPropertiesProperty
} from '@kix/core/dist/browser/model';
import {
    ConfiguredWidget,
    DashboardConfiguration,
    WidgetDescriptor,
    WidgetSize
} from '@kix/core/dist/model';
import { DashboardConfigurationDialogComponentState } from './model/DashboardConfigurationDialogComponentState';

class DashboardConfigurationDialog {

    private state: DashboardConfigurationDialogComponentState;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = new DashboardConfigurationDialogComponentState(
            [],
            [
                new SelectWithPropertiesProperty('active', 'Anzeigen', 'checkbox')
            ],
            [],
            [],
            [
                new SelectWithPropertiesProperty('active', 'Anzeigen', 'checkbox'),
                new SelectWithPropertiesProperty('size', 'Größen', 'radio',
                    [{ id: WidgetSize.SMALL, label: 's' }, { id: WidgetSize.LARGE, label: 'l' }]
                )
            ],
            [],
            [],
            [
                new SelectWithPropertiesProperty('active', 'Anzeigen', 'checkbox')
            ],
            null,
            []
        );
    }

    public async onMount(): Promise<void> {
        await DashboardStore.getInstance().loadDashboardConfiguration();
        this.state.dashboardConfig = DashboardStore.getInstance().getDashboardConfiguration();

        this.prepareFirstLists();
        this.prepareSecondLists();

        const translationHandler = await TranslationHandler.getInstance();
        // this.state.translations = translationHandler.getTranslations([]);
    }

    private prepareFirstLists(): void {
        const widgetDescriptorList = DashboardStore.getInstance().getAvailableWidgets();

        let explorerInstanceIds = [];
        this.state.dashboardConfig.explorerRows.forEach((row) => {
            explorerInstanceIds = [...explorerInstanceIds, ...row];
        });

        widgetDescriptorList.forEach((wd) => {
            if (wd.isExplorerWidget) {
                this.prepareExplorerList(wd, explorerInstanceIds);
            } else {
                const listId = wd.widgetId + '-' + Math.floor((Math.random() * 1000000));
                const listElement = new SelectWithFilterListElement(listId, wd.configuration.title);

                if (wd.isContentWidget) {
                    // TODO: handle required
                    // if (wd.required) {
                    //     this.state.contentSecondList.push(listElement);
                    // } else {
                    this.state.contentFirstList.push(listElement);
                    // }
                }
                if (wd.isSidebarWidget) {
                    // TODO: handle required
                    // if (wd.required) {
                    //     this.state.sidebarSecondList.push(listElement);
                    // } else {
                    this.state.sidebarFirstList.push(listElement);
                    // }
                }
                this.state.widgetDescriptorList.push({ listId, descriptor: wd });
            }
        });
        this.state.explorerList = this.state.explorerList.sort(this.sortList);
        this.state.contentFirstList = this.state.contentFirstList.sort(this.sortList);
        this.state.sidebarFirstList = this.state.sidebarFirstList.sort(this.sortList);
    }

    private prepareExplorerList(explorerDescriptor, explorerInstanceIds): void {
        const configuredExplorer = this.state.dashboardConfig.explorerConfiguredWidgets.find(
            (ce) => ce.configuration.widgetId === explorerDescriptor.widgetId
        );
        let listElement: SelectWithPropertiesListElement;
        if (configuredExplorer) {
            listElement = {
                id: configuredExplorer.instanceId,
                label: configuredExplorer.configuration.title,
                properties: {
                    active: explorerInstanceIds.some((wiId) => wiId === configuredExplorer.instanceId)
                },
                selected: false
            };
        } else {
            listElement = {
                id: explorerDescriptor.widgetId + '-' + Math.floor((Math.random() * 1000000)),
                label: explorerDescriptor.configuration.title,
                properties: {
                    active: true
                },
                selected: false
            };
        }
        this.state.explorerList.push(listElement);
    }

    private prepareSecondLists(): void {
        this.buildList(
            this.state.dashboardConfig.contentRows,
            this.state.dashboardConfig.contentConfiguredWidgets,
            this.state.contentSecondList
        );
        this.buildList(
            this.state.dashboardConfig.sidebarRows,
            this.state.dashboardConfig.sidebarConfiguredWidgets,
            this.state.sidebarSecondList
        );
    }

    private buildList(rows: string[][], configuredWidgets: ConfiguredWidget[], targetList: any[]): void {
        let instanceIds = [];
        rows.forEach((row) => {
            instanceIds = [...instanceIds, ...row];
        });
        configuredWidgets.forEach((configuredWidget: ConfiguredWidget) => {
            const listElement: SelectWithPropertiesListElement = {
                id: configuredWidget.instanceId,
                label: configuredWidget.configuration.title,
                properties: {
                    active: instanceIds.some((wiId) => wiId === configuredWidget.instanceId),
                    size: configuredWidget.configuration.size
                },
                selected: false
            };
            targetList.push(listElement);
        });
        targetList = targetList.sort(this.sortList);
    }

    private sortList(a, b): number {
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

    private addToContentSecondList(): void {
        this.addToList(
            this.state.contentFirstList,
            this.state.contentSecondList,
            this.state.dashboardConfig.contentConfiguredWidgets
        );
        this.state.contentSecondList = this.state.contentSecondList.sort(this.sortList);
        (this as any).setStateDirty('contentSecondList');
    }

    private addToSidebarSecondList(): void {
        this.addToList(
            this.state.sidebarFirstList,
            this.state.sidebarSecondList,
            this.state.dashboardConfig.sidebarConfiguredWidgets
        );
        this.state.sidebarSecondList = this.state.sidebarSecondList.sort(this.sortList);
        (this as any).setStateDirty('sidebarSecondList');
    }

    private addToList(
        sourceList: SelectWithFilterListElement[],
        targetList: SelectWithPropertiesListElement[],
        configuratedWidgets: ConfiguredWidget[]
    ): void {
        sourceList.forEach((le) => {
            if (le.selected) {
                le.selected = false;
                const descListElement = this.state.widgetDescriptorList.find((wdle) => wdle.listId === le.id);
                const newInstanceId = (Date.now() + Math.floor((Math.random() * 100000))).toString();
                const newSecondListElement = new SelectWithPropertiesListElement(
                    newInstanceId,
                    le.label,
                    {
                        active: true,
                        size: descListElement.descriptor.configuration.size
                    },
                    false
                );
                targetList.push(newSecondListElement);

                configuratedWidgets.push(
                    {
                        instanceId: newInstanceId,
                        configuration: { ...descListElement.descriptor.configuration }
                    }
                );
            }
        });
    }

    private removeFromContentSecondList(): void {
        const selectedList = this.state.contentSecondList.filter((le) => le.selected);
        if (selectedList.length) {
            this.state.contentSecondList = this.state.contentSecondList.filter((le) => !le.selected);

            selectedList.forEach((le) => {
                this.removeFromRows(le, this.state.dashboardConfig.contentRows);
            });

            this.state.dashboardConfig.contentConfiguredWidgets
                = this.state.dashboardConfig.contentConfiguredWidgets.filter((cw) => {
                    return !(selectedList.some((le) => le.id === cw.instanceId));
                });
        }
    }

    private removeFromSidebarSecondList(): void {
        const selectedList = this.state.sidebarSecondList.filter((le) => le.selected);
        if (selectedList.length) {
            this.state.sidebarSecondList = this.state.sidebarSecondList.filter((le) => !le.selected);

            selectedList.forEach((le) => {
                this.removeFromRows(le, this.state.dashboardConfig.sidebarRows);
            });

            this.state.dashboardConfig.sidebarConfiguredWidgets
                = this.state.dashboardConfig.sidebarConfiguredWidgets.filter((cw) => {
                    return !(selectedList.some((le) => le.id === cw.instanceId));
                });
        }
    }

    private removeFromRows(listElement: SelectWithPropertiesListElement, rows: string[][]): void {
        const rowIndex = rows.findIndex((r) => {
            return r.some((iid) => iid === listElement.id);
        });
        rows[rowIndex] = rows[rowIndex].filter((re) => listElement.id !== re);
        if (rows[rowIndex].length === 0) {
            rows.splice(rowIndex, 1);
        }
    }

    private cancel(): void {
        ApplicationStore.getInstance().toggleDialog();
    }

    private saveConfiguration(): void {
        this.state.explorerList.forEach((le) => {
            // TODO: dürfen alle explorer entfernt werden (nicht aktiv sein)? -> ggf. Sonderbehandlung
            this.updateRows(le, this.state.dashboardConfig.explorerRows);
            this.updateConfiguredWidgets(le, this.state.dashboardConfig.explorerConfiguredWidgets);
        });
        this.state.contentSecondList.forEach((le) => {
            this.updateRows(le, this.state.dashboardConfig.contentRows);
            this.updateConfiguredWidgets(le, this.state.dashboardConfig.contentConfiguredWidgets);
        });
        this.state.sidebarSecondList.forEach((le) => {
            this.updateRows(le, this.state.dashboardConfig.sidebarRows);
            this.updateConfiguredWidgets(le, this.state.dashboardConfig.sidebarConfiguredWidgets);
        });
        DashboardStore.getInstance().saveDashboardConfiguration(this.state.dashboardConfig);
        ApplicationStore.getInstance().toggleDialog();
    }

    private updateRows(listElement: SelectWithPropertiesListElement, rows: string[][]): void {
        const contained: boolean = rows.some((row) => {
            return row.some((iid) => iid === listElement.id);
        });
        if (
            listElement.properties.active && !contained
        ) {
            // TODO: bessere Handhabung beim Einfügen (bei "small" ggf. bestehende (letzte) rows auffüllen)
            rows.push([listElement.id]);
        } else if (
            !listElement.properties.active && contained
        ) {
            this.removeFromRows(listElement, rows);
        }
    }

    private updateConfiguredWidgets(
        listElement: SelectWithPropertiesListElement,
        configuratedWidgets: ConfiguredWidget[]
    ): void {
        const configuredWidget = configuratedWidgets.find((cw) => cw.instanceId === listElement.id);
        if (configuredWidget) {
            configuredWidget.configuration.size = listElement.properties.size;
        }
    }

    // private getTranslation(id: ConfigurationWidgetTranslationId): string {
    //     return (this.state.translations && this.state.translations[id]) ?
    // this.state.translations[id] : id.toString();
    // }
}

module.exports = DashboardConfigurationDialog;
