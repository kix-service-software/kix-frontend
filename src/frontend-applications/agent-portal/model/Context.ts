/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IContextListener } from '../modules/base-components/webapp/core/IContextListener';
import { KIXObjectType } from './kix/KIXObjectType';
import { KIXObject } from './kix/KIXObject';
import { ContextDescriptor } from './ContextDescriptor';
import { ContextConfiguration } from './configuration/ContextConfiguration';
import { AdditionalContextInformation } from '../modules/base-components/webapp/core/AdditionalContextInformation';
import { ConfiguredWidget } from './configuration/ConfiguredWidget';
import { WidgetConfiguration } from './configuration/WidgetConfiguration';
import { WidgetType } from './configuration/WidgetType';
import { ContextMode } from './ContextMode';
import { FormContext } from './configuration/FormContext';
import { FormService } from '../modules/base-components/webapp/core/FormService';
import { BreadcrumbInformation } from './BreadcrumbInformation';
import { KIXObjectService } from '../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../modules/icon/model/ObjectIcon';
import { EventService } from '../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../modules/base-components/webapp/core/ApplicationEvent';
import { ClientStorageService } from '../modules/base-components/webapp/core/ClientStorageService';
import { KIXObjectLoadingOptions } from './KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from './KIXObjectSpecificLoadingOptions';

export abstract class Context {

    protected listeners: Map<string, IContextListener> = new Map();

    public explorerMinimizedStates: Map<string, boolean> = new Map();
    public explorerBarExpanded: boolean = true;
    public shownSidebars: string[] = [];

    private dialogSubscriberId: string = null;
    private additionalInformation: Map<string, any> = new Map();

    protected objectLists: Map<KIXObjectType | string, KIXObject[]> = new Map();
    protected filteredObjectLists: Map<KIXObjectType | string, KIXObject[]> = new Map();

    private scrollInormation: [KIXObjectType | string, string | number] = null;

    public constructor(
        protected descriptor: ContextDescriptor,
        protected objectId: string | number = null,
        protected configuration: ContextConfiguration = null
    ) {
        if (this.configuration) {
            this.setConfiguration(configuration);
        }

        if (this.descriptor) {
            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, {
                eventSubscriberId: this.descriptor.contextId + '-update-listener',
                eventPublished: (data: any) => {
                    if (data && data.objectType) {
                        if (this.objectLists.has(data.objectType)) {
                            this.deleteObjectList(data.objectType);
                        }
                        if (
                            this.descriptor.contextMode === ContextMode.DETAILS
                            && Array.isArray(this.descriptor.kixObjectTypes)
                            && this.descriptor.kixObjectTypes.some((t) => t === data.objectType)
                        ) {
                            this.getObject(data.objectType, true);
                        }
                    }
                }
            });
        }
    }

    public async initContext(): Promise<void> {
        return;
    }

    public addObjectDependency(objectType: KIXObjectType | string): void {
        const type = this.descriptor.kixObjectTypes.find((ot) => ot === objectType);
        if (!type) {
            this.descriptor.kixObjectTypes.push(objectType);
        }
    }

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-unknown';
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
        this.shownSidebars = [...this.configuration.sidebars.map((s) => s.instanceId)];
        if (this.shownSidebars.length) {
            this.filterShownSidebarsByPreference();
        }
    }

    private filterShownSidebarsByPreference(): void {
        const shownSidebarsOption = ClientStorageService.getOption(this.configuration.id + '-context-shown-sidebars');
        if (shownSidebarsOption || shownSidebarsOption === '') {
            const shownSidebarsInPreference = shownSidebarsOption.split('###');
            this.shownSidebars = this.shownSidebars.filter(
                (s) => shownSidebarsInPreference.some((sP) => sP === s)
            );
        }
    }

    public setAdditionalInformation(key: string, value: any): void {
        this.additionalInformation.set(key, value);
        this.listeners.forEach((l) => l.additionalInformationChanged(key, value));
    }

    public resetAdditionalInformation(keepFormId: boolean = true): void {
        const newInformations = new Map();
        if (keepFormId && this.additionalInformation.has(AdditionalContextInformation.FORM_ID)) {
            newInformations.set(
                AdditionalContextInformation.FORM_ID,
                this.additionalInformation.get(AdditionalContextInformation.FORM_ID)
            );
        }
        this.additionalInformation = newInformations;
    }

    public setDialogSubscriberId(subscriberId: string): void {
        this.dialogSubscriberId = subscriberId;
    }

    public getDialogSubscriberId(): string {
        return this.dialogSubscriberId;
    }

    public async getObjectList(objectType: KIXObjectType | string): Promise<KIXObject[]> {
        if (!objectType) {
            const values = this.objectLists.values();
            const list = values.next();
            return list.value;
        } else if (!this.objectLists.has(objectType)) {
            await this.reloadObjectList(objectType);
        }
        return this.objectLists.get(objectType);
    }

    public setObjectList(objectType: KIXObjectType | string, objectList: KIXObject[], silent?: boolean) {
        this.objectLists.set(objectType, objectList);
        if (!silent) {
            this.listeners.forEach((l) => l.objectListChanged(objectType, objectList));
        }
    }

    public deleteObjectList(objectType: KIXObjectType | string): void {
        if (this.objectLists.has(objectType)) {
            this.objectLists.delete(objectType);
            this.listeners.forEach((l) => l.objectListChanged(objectType, []));
        }
    }

    public async setObjectId(objectId: string | number): Promise<void> {
        this.objectId = objectId;
        await this.getObject(undefined, true);
    }

    public getObjectId(): string | number {
        return this.objectId;
    }

    public getFilteredObjectList(objectType: KIXObjectType | string): KIXObject[] {
        return this.filteredObjectLists.get(objectType);
    }

    public setFilteredObjectList(objectType: KIXObjectType | string, filteredObjectList: KIXObject[]) {
        this.filteredObjectLists.set(objectType, filteredObjectList);
        this.listeners.forEach((l) => l.filteredObjectListChanged(objectType, filteredObjectList));
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
        let lanes = this.configuration.lanes;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid.instanceId) !== -1
            );
        }

        return lanes;
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.content;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid.instanceId) !== -1
            );
        }

        return content;
    }

    public getExplorer(show: boolean = false): ConfiguredWidget[] {
        let explorer = this.configuration.explorer;

        if (show && explorer) {
            explorer = explorer.filter(
                (ex) => this.configuration.explorer.some((e) => ex.instanceId === e.instanceId)
            );
        }

        return explorer;
    }

    public getSidebars(show: boolean = false): ConfiguredWidget[] {
        let sidebars = this.configuration.sidebars;

        if (show && sidebars) {
            sidebars = sidebars.filter((sb) => this.shownSidebars.some((s) => sb.instanceId === s));
        }

        return sidebars;
    }

    public toggleSidebarWidget(instanceId: string): void {
        const sidebar = this.configuration.sidebars.find((s) => s.instanceId === instanceId);
        if (sidebar) {

            const index = this.shownSidebars.findIndex((s) => s === instanceId);
            if (index !== -1) {
                this.shownSidebars.splice(index, 1);
            } else {
                this.shownSidebars.push(instanceId);
            }

            this.setShownSidebarPreference();
            this.listeners.forEach((l) => l.sidebarToggled());
        }
    }

    public closeAllSidebars(): void {
        this.shownSidebars = [];
        this.setShownSidebarPreference();
        this.listeners.forEach((l) => l.sidebarToggled());
    }

    public openAllSidebars(): void {
        this.shownSidebars = [];
        this.shownSidebars = this.configuration.sidebars.map((s) => s.instanceId);
        this.setShownSidebarPreference();
        this.listeners.forEach((l) => l.sidebarToggled());
    }

    private setShownSidebarPreference(): void {
        ClientStorageService.setOption(
            this.configuration.id + '-context-shown-sidebars',
            this.shownSidebars ? this.shownSidebars.map((s) => s).join('###') : ''
        );
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

    public areSidebarsShown(): boolean {
        const sidebars = this.shownSidebars;
        return sidebars ? sidebars.length > 0 : false;
    }

    public getWidgetConfiguration(instanceId: string): WidgetConfiguration {
        let configuration: WidgetConfiguration;

        if (this.configuration) {
            const explorer = this.configuration.explorer.find((e) => e.instanceId === instanceId);
            configuration = explorer ? explorer.configuration : undefined;

            if (!configuration) {
                const sidebar = this.configuration.sidebars.find((e) => e.instanceId === instanceId);
                configuration = sidebar ? sidebar.configuration : undefined;
            }

            if (!configuration) {
                const overlay = this.configuration.overlays.find((o) => o.instanceId === instanceId);
                configuration = overlay ? overlay.configuration : undefined;
            }

            if (!configuration) {
                const laneWidget = this.configuration.lanes.find((lw) => lw.instanceId === instanceId);
                configuration = laneWidget ? laneWidget.configuration : undefined;
            }

            if (!configuration) {
                const contentWidget = this.configuration.content.find((cw) => cw.instanceId === instanceId);
                configuration = contentWidget ? contentWidget.configuration : undefined;
            }

            if (!configuration) {
                const otherWidget = this.configuration.others.find((cw) => cw.instanceId === instanceId);
                configuration = otherWidget ? otherWidget.configuration : undefined;
            }
        }

        return configuration;
    }

    public getContextSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        if (this.configuration) {
            const sidebar = this.configuration.sidebars.find((sw) => sw.instanceId === instanceId);
            widgetType = sidebar ? WidgetType.SIDEBAR : undefined;

            if (!widgetType) {
                const explorer = this.configuration.explorer.find((ex) => ex.instanceId === instanceId);
                widgetType = explorer ? WidgetType.EXPLORER : undefined;
            }

            if (!widgetType) {
                const overlay = this.configuration.overlays.find((ow) => ow.instanceId === instanceId);
                widgetType = overlay ? WidgetType.OVERLAY : undefined;
            }

            if (!widgetType) {
                const laneWidget = this.configuration.lanes.find((lw) => lw.instanceId === instanceId);
                widgetType = laneWidget ? WidgetType.LANE : undefined;
            }
        }

        return widgetType;
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = null, reload: boolean = false, changedProperties?: string[]
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

    public provideScrollInformation(objectType: KIXObjectType | string, objectId: string | number): void {
        this.scrollInormation = [objectType, objectId];

        this.listeners.forEach((l) => l.scrollInformationChanged(this.scrollInormation[0], this.scrollInormation[1]));
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const text = await this.getDisplayText();
        return new BreadcrumbInformation(this.getIcon(), [], text);
    }

    public reset(refresh?: boolean): void {
        this.resetAdditionalInformation();
        this.objectId = null;
        this.objectLists.clear();
    }

    public async getFormId(
        contextMode: ContextMode, objectType: KIXObjectType | string, objectId: string | number
    ): Promise<string> {
        const formContext =
            contextMode === ContextMode.EDIT ||
                contextMode === ContextMode.EDIT_ADMIN ||
                contextMode === ContextMode.EDIT_BULK
                ? FormContext.EDIT
                : FormContext.NEW;

        return await FormService.getInstance().getFormIdByContext(formContext, objectType);
    }

    public async reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        return;
    }

    protected async loadDetailsObject<T extends KIXObject>(
        objectType: KIXObjectType | string, loadingOptions: KIXObjectLoadingOptions = null,
        objectSpecificLoadingOptions: KIXObjectSpecificLoadingOptions = null,
        silent: boolean = true, cache?: boolean, forceIds?: boolean
    ): Promise<T> {
        let object: T;

        if (this.objectId) {
            const objectId = Number(this.objectId);

            const objects = await KIXObjectService.loadObjects<T>(
                objectType, [objectId], loadingOptions, objectSpecificLoadingOptions, silent, cache, forceIds
            ).catch((error) => {
                console.error(error);
                return null;
            });

            if (objects && objects.length) {
                object = objects[0];
                this.objectId = object.ObjectId;
            }
        }

        return object;
    }

}
