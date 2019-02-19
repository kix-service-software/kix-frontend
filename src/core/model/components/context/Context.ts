import { ConfiguredWidget } from '../widget/ConfiguredWidget';
import { ContextConfiguration } from '.';
import { WidgetConfiguration, WidgetType } from '..';
import { IContextListener } from '../../../browser/context/IContextListener';
import { KIXObject, KIXObjectType } from '../..';
import { ObjectIcon } from '../../kix';
import { ContextDescriptor } from './ContextDescriptor';
import { BreadcrumbInformation } from '../router';

export abstract class Context<T extends ContextConfiguration = ContextConfiguration> {

    protected listeners: Map<string, IContextListener> = new Map();

    public explorerMinimizedStates: Map<string, boolean> = new Map();
    public explorerBarExpanded: boolean = true;
    public shownSidebars: string[] = [];

    private dialogSubscriberId: string = null;
    private additionalInformation: string[] = [];
    private objectList: KIXObject[] = [];
    private filteredObjectList: KIXObject[] = [];

    public constructor(
        protected descriptor: ContextDescriptor,
        protected objectId: string | number = null,
        protected configuration: T = null
    ) {
        if (this.configuration) {
            this.setConfiguration(configuration);
        }
    }

    protected abstract getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS>;

    protected abstract getSpecificWidgetType(instanceId: string): WidgetType;

    public async initContext(): Promise<void> {
        return;
    }

    public getIcon(): string | ObjectIcon {
        return "kix-icon-unknown";
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return this.descriptor.contextId;
    }

    public getAdditionalInformation(): string[] {
        return this.additionalInformation;
    }

    public getDescriptor(): ContextDescriptor {
        return this.descriptor;
    }

    public getConfiguration(): T {
        return this.configuration;
    }

    public setConfiguration(configuration: T): void {
        this.configuration = configuration;
        this.shownSidebars = configuration
            ? [...configuration.sidebars.filter(
                (s) => configuration.sidebarWidgets.some((sw) => sw.instanceId === s && sw.configuration.show)
            )]
            : [];
    }

    public setAdditionalInformation(additionalInformation: string[]): void {
        this.additionalInformation = additionalInformation;
    }

    public setDialogSubscriberId(subscriberId: string): void {
        this.dialogSubscriberId = subscriberId;
    }

    public getDialogSubscriberId(): string {
        return this.dialogSubscriberId;
    }

    public async getObjectList(reload: boolean = false): Promise<KIXObject[]> {
        return this.objectList;
    }

    public setObjectList(objectList: KIXObject[]) {
        this.objectList = objectList;
        this.listeners.forEach((l) => l.objectListChanged(this.objectList));
    }

    public async setObjectId(objectId: string | number): Promise<void> {
        this.objectId = objectId;
        await this.getObject(null, true);
    }

    public getObjectId(): string | number {
        return this.objectId;
    }

    public getFilteredObjectList(): KIXObject[] {
        return this.filteredObjectList;
    }

    public setFilteredObjectList(filteredObjectList: KIXObject[]) {
        this.filteredObjectList = filteredObjectList;
        this.listeners.forEach((l) => l.filteredObjectListChanged(this.filteredObjectList));
    }

    public registerListener(listenerId: string, listener: IContextListener): void {
        if (listenerId) {
            this.listeners.set(listenerId, listener);
        }
    }

    public unregisterListener(listenerId: string): void {
        if (this.listeners.has(listenerId)) {
            this.listeners.delete(listenerId);
        }
    }

    public getExplorer(show: boolean = false): ConfiguredWidget[] {
        let explorer = this.configuration.explorerWidgets;

        if (show && explorer) {
            explorer = explorer.filter(
                (ex) => this.configuration.explorer.findIndex((e) => ex.instanceId === e) !== -1
            );
        }

        return explorer;
    }

    public getSidebars(show: boolean = false): ConfiguredWidget[] {
        let sidebars = this.configuration.sidebarWidgets;

        if (show && sidebars) {
            sidebars = sidebars.filter(
                (sb) => this.shownSidebars.some((s) => sb.instanceId === s)
            );
        }

        return sidebars;
    }

    public toggleSidebar(instanceId: string): void {
        const sidebar = this.configuration.sidebars.find((s) => s === instanceId);
        if (sidebar) {

            const index = this.shownSidebars.findIndex((s) => s === instanceId);
            if (index !== -1) {
                this.shownSidebars.splice(index, 1);
            } else {
                this.shownSidebars.push(instanceId);
            }

            this.listeners.forEach((l) => l.sidebarToggled());
        }
    }

    public toggleExplorerBar(): void {
        this.explorerBarExpanded = !this.explorerBarExpanded;
        this.listeners.forEach((l) => l.explorerBarToggled());
    }

    public isExplorerExpanded(explorerId: string): boolean {
        let expanded = false;
        if (this.explorerMinimizedStates.has(explorerId)) {
            expanded = this.explorerMinimizedStates.get(explorerId);
        }

        return expanded;
    }

    public isExplorerBarShown(): boolean {
        const explorer = this.getExplorer(true);
        return explorer ? explorer.length > 0 : false;
    }

    public isSidebarShown(): boolean {
        const sidebars = this.shownSidebars;
        return sidebars ? sidebars.length > 0 : false;
    }

    public getWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        let configuration: WidgetConfiguration<WS>;

        if (this.configuration) {
            const explorer = this.configuration.explorerWidgets.find((e) => e.instanceId === instanceId);
            configuration = explorer ? explorer.configuration : undefined;

            if (!configuration) {
                const sidebar = this.configuration.sidebarWidgets.find((e) => e.instanceId === instanceId);
                configuration = sidebar ? sidebar.configuration : undefined;
            }

            if (!configuration) {
                const overlay = this.configuration.overlayWidgets.find((o) => o.instanceId === instanceId);
                configuration = overlay ? overlay.configuration : undefined;
            }
        }

        if (!configuration) {
            configuration = this.getSpecificWidgetConfiguration(instanceId);
        }

        return configuration;
    }

    public getContextSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        if (this.configuration) {
            const sidebar = this.configuration.sidebarWidgets.find((sw) => sw.instanceId === instanceId);
            widgetType = sidebar ? WidgetType.SIDEBAR : undefined;

            if (!widgetType) {
                const explorer = this.configuration.explorerWidgets.find((ex) => ex.instanceId === instanceId);
                widgetType = explorer ? WidgetType.EXPLORER : undefined;
            }

            if (!widgetType) {
                const overlay = this.configuration.overlayWidgets.find((ow) => ow.instanceId === instanceId);
                widgetType = overlay ? WidgetType.OVERLAY : undefined;
            }
        }

        if (!widgetType) {
            widgetType = this.getSpecificWidgetType(instanceId);
        }

        return widgetType;
    }

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = null, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        return undefined;
    }

    public getBreadcrumbInformation(): BreadcrumbInformation {
        return new BreadcrumbInformation(this.getIcon(), []);
    }

    public reset(): void {
        return;
    }

}
