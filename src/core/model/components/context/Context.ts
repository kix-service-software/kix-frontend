import { ConfiguredWidget } from '../widget/ConfiguredWidget';
import { ContextConfiguration } from '.';
import { WidgetConfiguration, WidgetType } from '..';
import { IContextListener } from '../../../browser/context/IContextListener';
import { KIXObject, KIXObjectType } from '../..';
import { ObjectIcon } from '../../kix';
import { ContextDescriptor } from './ContextDescriptor';
import { BreadcrumbInformation } from '../router';
import { KIXObjectService, FormService } from '../../../browser';
import { ContextMode } from './ContextMode';
import { FormContext } from '../form/FormContext';

export abstract class Context {

    protected listeners: Map<string, IContextListener> = new Map();

    public explorerMinimizedStates: Map<string, boolean> = new Map();
    public explorerBarExpanded: boolean = true;
    public shownSidebars: string[] = [];

    private dialogSubscriberId: string = null;
    private additionalInformation: Map<string, any> = new Map();
    private objectList: KIXObject[] = [];
    private filteredObjectList: KIXObject[] = [];

    private scrollInormation: [KIXObjectType, string | number] = null;

    public constructor(
        protected descriptor: ContextDescriptor,
        protected objectId: string | number = null,
        protected configuration: ContextConfiguration = null
    ) {
        if (this.configuration) {
            this.setConfiguration(configuration);
        }
    }

    public async initContext(): Promise<void> {
        return;
    }

    public getIcon(): string | ObjectIcon {
        return "kix-icon-unknown";
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return this.descriptor.contextId;
    }

    public getAdditionalInformation(key: string): any {
        return this.additionalInformation.get(key);
    }

    public getDescriptor(): ContextDescriptor {
        return this.descriptor;
    }

    public getConfiguration(): ContextConfiguration {
        return this.configuration;
    }

    public setConfiguration(configuration: ContextConfiguration): void {
        this.configuration = configuration;
        this.shownSidebars = configuration
            ? [...configuration.sidebars.filter(
                (s) => configuration.sidebarWidgets.some((sw) => sw.instanceId === s && sw.configuration.show)
            )]
            : [];
    }

    public setAdditionalInformation(key: string, value: any): void {
        this.additionalInformation.set(key, value);
    }

    public resetAdditionalInformation(): void {
        this.additionalInformation = new Map();
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

    public getLanes(show: boolean = false): ConfiguredWidget[] {
        let lanes = this.configuration.laneWidgets;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid) !== -1
            );
        }

        return lanes;
    }

    public getLaneTabs(show: boolean = false): ConfiguredWidget[] {
        let laneTabs = this.configuration.laneTabWidgets;

        if (show) {
            laneTabs = laneTabs.filter(
                (lt) => this.configuration.laneTabs.findIndex((ltId) => lt.instanceId === ltId) !== -1
            );
        }

        return laneTabs;
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid) !== -1
            );
        }

        return content;
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

            if (!configuration) {
                const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
                configuration = laneWidget ? laneWidget.configuration : undefined;
            }

            if (!configuration) {
                const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
                configuration = laneTabWidget ? laneTabWidget.configuration : undefined;
            }

            if (!configuration) {
                const contentWidget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
                configuration = contentWidget ? contentWidget.configuration : undefined;
            }
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

            if (!widgetType) {
                const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
                widgetType = laneWidget ? WidgetType.LANE : undefined;
            }

            if (!widgetType) {
                const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
                widgetType = laneTabWidget ? WidgetType.LANE_TAB : undefined;
            }
        }

        return widgetType;
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = null, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        if (objectType) {
            const objectId = this.getObjectId();
            if (objectId) {
                const objects = await KIXObjectService.loadObjects(objectType, [objectId]);
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }

    public provideScrollInformation(objectType: KIXObjectType, objectId: string | number): void {
        this.scrollInormation = [objectType, objectId];

        this.listeners.forEach((l) => l.scrollInformationChanged(this.scrollInormation[0], this.scrollInormation[1]));
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const text = await this.getDisplayText();
        return new BreadcrumbInformation(this.getIcon(), [], text);
    }

    public reset(): void {
        this.resetAdditionalInformation();
    }

    public async getFormId(
        contextMode: ContextMode, objectType: KIXObjectType, objectId: string | number
    ): Promise<string> {
        const formContext =
            contextMode === ContextMode.EDIT ||
                contextMode === ContextMode.EDIT_ADMIN ||
                contextMode === ContextMode.EDIT_BULK
                ? FormContext.EDIT
                : FormContext.NEW;

        return await FormService.getInstance().getFormIdByContext(formContext, objectType);
    }

}
