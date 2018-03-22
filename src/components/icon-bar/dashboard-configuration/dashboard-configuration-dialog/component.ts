import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import {
    SelectWithFilterListElement,
    SelectWithPropertiesListElement,
    SelectWithPropertiesProperty
} from '@kix/core/dist/browser/model';
import {
    ConfiguredWidget,
    DashboardConfiguration,
    WidgetDescriptor,
    WidgetSize,
    WidgetType
} from '@kix/core/dist/model';
import { DashboardConfigurationDialogComponentState } from './model/DashboardConfigurationDialogComponentState';
import { ContextService } from '@kix/core/dist/browser/context/';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import { IdService } from '@kix/core/dist/browser/IdService';

class DashboardConfigurationDialog {

    private state: DashboardConfigurationDialogComponentState;

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
        const context = ContextService.getInstance().getContext();
        this.state.dashboardConfig = context ? context.dashboardConfiguration : undefined;

        this.prepareFirstLists();
        this.prepareSecondLists();
    }

    private prepareFirstLists(): void {
        const widgetDescriptorList = DashboardService.getInstance().getAvailableWidgets();

        let explorerInstanceIds = [];
        this.state.dashboardConfig.explorerRows.forEach((row) => {
            explorerInstanceIds = [...explorerInstanceIds, ...row];
        });

        widgetDescriptorList.forEach((wd) => {
            if ((wd.type & WidgetType.EXPLORER) === WidgetType.EXPLORER) {
                this.prepareExplorerList(wd, explorerInstanceIds);
            } else {
                const listId = wd.widgetId + '-' + Math.floor((Math.random() * 1000000));
                const listElement = new SelectWithFilterListElement(listId, wd.configuration.title);

                if ((wd.type & WidgetType.CONTENT) === WidgetType.CONTENT) {
                    this.state.contentFirstList.push(listElement);
                }
                if ((wd.type & WidgetType.SIDEBAR) === WidgetType.SIDEBAR) {
                    this.state.sidebarFirstList.push(listElement);
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
            listElement = new SelectWithPropertiesListElement(
                configuredExplorer.instanceId,
                configuredExplorer.configuration.title,
                {
                    active: explorerInstanceIds.some((wiId) => wiId === configuredExplorer.instanceId)
                },
                false
            );
        } else {
            const newInstanceId = IdService.generateDateBasedRandomId();
            listElement = new SelectWithPropertiesListElement(
                newInstanceId,
                explorerDescriptor.configuration.title,
                {
                    active: true
                },
                false
            );
            this.state.dashboardConfig.explorerConfiguredWidgets.push({
                instanceId: newInstanceId,
                configuration: { ...explorerDescriptor.configuration }
            });
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
            const listElement = new SelectWithPropertiesListElement(
                configuredWidget.instanceId,
                configuredWidget.configuration.title,
                {
                    active: instanceIds.some((wiId) => wiId === configuredWidget.instanceId),
                    size: configuredWidget.configuration.size
                },
                false
            );
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
                const newInstanceId = IdService.generateDateBasedRandomId();
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
        ApplicationService.getInstance().toggleMainDialog();
    }

    private saveConfiguration(): void {
        this.state.explorerList.forEach((le) => {
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

        DashboardService.getInstance().saveDashboardConfiguration(this.state.dashboardConfig);
        ApplicationService.getInstance().toggleMainDialog();
    }

    private updateRows(listElement: SelectWithPropertiesListElement, rows: string[][]): void {
        const contained: boolean = rows.some((row) => {
            return row.some((iid) => iid === listElement.id);
        });
        if (
            listElement.properties.active && !contained
        ) {
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
}

module.exports = DashboardConfigurationDialog;
