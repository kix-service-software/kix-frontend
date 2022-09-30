/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { KIXObjectService } from '../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../modules/icon/model/ObjectIcon';
import { EventService } from '../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../modules/base-components/webapp/core/ApplicationEvent';
import { ClientStorageService } from '../modules/base-components/webapp/core/ClientStorageService';
import { KIXObjectLoadingOptions } from './KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from './KIXObjectSpecificLoadingOptions';
import { ContextService } from '../modules/base-components/webapp/core/ContextService';
import { AbstractAction } from '../modules/base-components/webapp/core/AbstractAction';
import { AuthenticationSocketClient } from '../modules/base-components/webapp/core/AuthenticationSocketClient';
import { ContextFormManager } from './ContextFormManager';
import { IdService } from './IdService';
import { TranslationService } from '../modules/translation/webapp/core/TranslationService';
import { ContextStorageManager } from './ContextStorageManager';
import { ContextEvents } from '../modules/base-components/webapp/core/ContextEvents';
import { ContextPreference } from './ContextPreference';
import { AgentService } from '../modules/user/webapp/core/AgentService';
import { IEventSubscriber } from '../modules/base-components/webapp/core/IEventSubscriber';
import { ContextExtension } from './ContextExtension';

export abstract class Context {

    protected listeners: Map<string, IContextListener> = new Map();

    public explorerMinimizedStates: Map<string, boolean> = new Map();
    public explorerBarExpanded: boolean = true;
    public openSidebarWidgets: string[] = [];

    public contextId: string;

    private dialogSubscriberId: string = null;
    protected additionalInformation: Map<string, any> = new Map();

    protected objectLists: Map<KIXObjectType | string, KIXObject[]> = new Map();
    protected filteredObjectLists: Map<KIXObjectType | string, KIXObject[]> = new Map();

    private scrollInormation: [KIXObjectType | string, string | number] = null;
    protected displayText: string;
    protected icon: ObjectIcon | string;

    private eventSubsriber: IEventSubscriber;

    public contextExtensions: ContextExtension[] = [];

    public initialized: boolean = false;

    public constructor(
        public descriptor: ContextDescriptor,
        protected objectId: string | number = null,
        protected configuration: ContextConfiguration = null,
        public instanceId?: string,
        protected formManager?: ContextFormManager,
        protected storageManager?: ContextStorageManager
    ) {
        if (this.configuration) {
            this.setConfiguration(configuration);
        }

        if (!instanceId) {
            this.instanceId = IdService.generateDateBasedId();
        }

        const extensions = ContextService?.getInstance()?.getContextExtensions(this.descriptor?.contextId);
        if (Array.isArray(extensions)) {
            this.contextExtensions = extensions.map((e) => new e());
        }

        if (!formManager) {
            this.formManager = new ContextFormManager(this);
        } else {
            this.formManager.setContext(this);
        }

        if (!storageManager) {
            this.storageManager = new ContextStorageManager(this);
        } else {
            this.storageManager.setContext(this);
        }

        if (this.descriptor) {

            this.contextId = descriptor.contextId;

            this.eventSubsriber = {
                eventSubscriberId: this.instanceId,
                eventPublished: async (data: any, eventId: string): Promise<void> => {
                    const contextUpdateRequired = eventId === ContextEvents.CONTEXT_UPDATE_REQUIRED &&
                        data?.instanceId === this.instanceId;

                    const objectUpdate = eventId === ApplicationEvent.OBJECT_UPDATED && data?.objectType;

                    if (this.descriptor.contextMode !== ContextMode.SEARCH) {
                        if (objectUpdate) {
                            if (this.objectLists.has(data.objectType)) {
                                this.deleteObjectList(data.objectType);
                            }

                            const objectReloadRequired = this.descriptor.contextMode === ContextMode.DETAILS
                                && this.descriptor.kixObjectTypes?.some((t) => t === data.objectType);

                            if (objectReloadRequired) {
                                await this.getObject(data.objectType, true);
                            }

                        } else if (contextUpdateRequired) {
                            this.deleteObjectLists();
                        }
                    }
                }
            };

            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.eventSubsriber);
            EventService.getInstance().subscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.eventSubsriber);
        }
    }

    public async destroy(): Promise<void> {
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.eventSubsriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.eventSubsriber);

        await this.formManager?.destroy();

        return;
    }

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        for (const extension of this.contextExtensions) {
            await extension.initContext(this, urlParams);
        }

        if (urlParams) {
            urlParams.forEach((value: string, key: string) => this.setAdditionalInformation(key, value));
        }

        if (urlParams) {
            await this.update(urlParams);
        }
    }

    public async postInit(): Promise<void> {
        const formId = this.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
        if (formId && !this.formManager.formId) {
            await this.formManager.setFormId(formId);
        }
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        return;
    }

    public getFormManager(): ContextFormManager {
        return this.formManager;
    }

    public getStorageManager(): ContextStorageManager {
        return this.storageManager;
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            if (this.descriptor.contextMode === ContextMode.DETAILS) {
                url += `/${this.getObjectId()}`;
            } else if (this.descriptor.contextMode === ContextMode.CREATE) {
                url += '?new';
            }
        }
        return url;
    }

    public async addExtendedUrlParams(url: string): Promise<string> {
        for (const extension of this.contextExtensions) {
            url = await extension.addExtendedUrlParams(url);
        }
        return url;
    }

    public async getAdditionalActions(object?: KIXObject): Promise<AbstractAction[]> {
        let actions: AbstractAction[] = [];
        for (const extension of this.contextExtensions) {
            const extendedActions = await extension.getAdditionalActions(this, object);
            if (Array.isArray(extendedActions)) {
                actions = [...actions, ...extendedActions];
            }
        }
        return actions;
    }

    public async setFormObject(overwrite: boolean = true): Promise<void> {
        return;
    }

    public getIcon(): string | ObjectIcon {
        let icon = this.icon;
        if (!icon) {
            icon = this.getAdditionalInformation(AdditionalContextInformation.ICON);
        }

        if (!icon) {
            icon = this.descriptor.icon;
        }

        return icon;
    }

    public setIcon(icon: ObjectIcon | string): void {
        this.icon = icon;
        EventService.getInstance().publish(ContextEvents.CONTEXT_ICON_CHANGED, this);
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        let displayText = this.displayText;
        if (!displayText) {
            displayText = this.getAdditionalInformation(AdditionalContextInformation.DISPLAY_TEXT);
        }
        if (!displayText) {
            displayText = this.descriptor.displayText;
        }

        return await TranslationService.translate(displayText);
    }

    public setDisplayText(text: string): void {
        this.displayText = text;
        EventService.getInstance().publish(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, this);
    }

    public getAdditionalInformation(key: string): any {
        return this.additionalInformation.get(key);
    }

    public getConfiguration(): ContextConfiguration {
        return this.configuration;
    }

    public setConfiguration(configuration: ContextConfiguration): void {
        this.configuration = configuration;
        this.openSidebarWidgets = [
            ...this.configuration.explorer.map((s) => s.instanceId),
            ...this.configuration.sidebars.map((s) => s.instanceId)
        ];
        if (this.openSidebarWidgets.length) {
            this.filterSidebarWidgetsByPreference();
        }
    }

    private filterSidebarWidgetsByPreference(left: boolean = false): void {
        const opendedSidebarsOption = ClientStorageService.getOption(`${this.configuration.id}-context-open-sidebar-widgets`);
        if (opendedSidebarsOption || opendedSidebarsOption === '') {
            const shownSidebarsInPreference = opendedSidebarsOption.split('###');
            this.openSidebarWidgets = this.openSidebarWidgets.filter(
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

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        if (!objectType) {
            const values = this.objectLists.values();
            const list = values.next();
            return list.value;
        } else if (!this.objectLists.has(objectType)) {
            await this.reloadObjectList(objectType);
        }
        return this.objectLists.get(objectType) as any[];
    }

    public hasObjectList(objectType: KIXObjectType | string): boolean {
        return this.objectLists.has(objectType);
    }

    public setObjectList(objectType: KIXObjectType | string, objectList: KIXObject[], silent?: boolean): void {
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

    public deleteObjectLists(): void {
        this.objectLists.clear();
        this.listeners.forEach((l) => l.objectListChanged(null, []));
    }

    public async setObjectId(objectId: string | number, objectType: KIXObjectType | string): Promise<void> {
        this.objectId = objectId;
        this.getObject(objectType, true);
    }

    public getObjectId(): string | number {
        return this.objectId;
    }

    public getFilteredObjectList<T extends KIXObject = KIXObject>(objectType: KIXObjectType | string): T[] {
        return this.filteredObjectLists.get(objectType) as any[];
    }

    public setFilteredObjectList(
        objectType: KIXObjectType | string, filteredObjectList: KIXObject[], silent: boolean = false
    ): void {
        this.filteredObjectLists.set(objectType, filteredObjectList);
        if (!silent) {
            this.listeners.forEach((l) => l.filteredObjectListChanged(objectType, filteredObjectList));
        }
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

    public async getLanes(show: boolean = false): Promise<ConfiguredWidget[]> {
        let lanes = this.configuration.lanes;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid.instanceId) !== -1
            );
        }

        const allowedWidgets = await this.filterAllowedWidgets(lanes);
        return allowedWidgets;
    }

    public async getContent(show: boolean = false): Promise<ConfiguredWidget[]> {
        let content = this.configuration.content;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid.instanceId) !== -1
            );
        }

        const userWidgets = await this.getUserWidgetList('content');
        const widgets = this.mergeWidgetLists(content, userWidgets);

        const allowedWidgets = await this.filterAllowedWidgets(widgets);
        return allowedWidgets;
    }

    public async getSidebarsLeft(show: boolean = false): Promise<ConfiguredWidget[]> {
        let sidebarsLeft = this.configuration.explorer;

        if (show && sidebarsLeft) {
            sidebarsLeft = sidebarsLeft.filter((sb) => this.openSidebarWidgets.some((s) => sb.instanceId === s));
        }

        const allowedWidgets = await this.filterAllowedWidgets(sidebarsLeft);
        return allowedWidgets;
    }

    public async getSidebarsRight(show: boolean = false): Promise<ConfiguredWidget[]> {
        let sidebarsRight = this.configuration.sidebars;

        if (show && sidebarsRight) {
            sidebarsRight = sidebarsRight.filter((sb) => this.openSidebarWidgets.some((s) => sb.instanceId === s));
        }

        const allowedWidgets = await this.filterAllowedWidgets(sidebarsRight);
        return allowedWidgets;
    }

    private async filterAllowedWidgets(widgets: ConfiguredWidget[]): Promise<ConfiguredWidget[]> {
        const allowedWidgets: ConfiguredWidget[] = [];
        for (const widget of widgets) {
            if (Array.isArray(widget.permissions)) {
                const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(widget.permissions);
                if (allowed) {
                    allowedWidgets.push(widget);
                }
            } else {
                allowedWidgets.push(widget);
            }
        }
        return allowedWidgets;
    }

    private async getUserWidgetList(contextWidgetList: string): Promise<Array<string | ConfiguredWidget>> {
        let widgets: ConfiguredWidget[] = [];
        const currentUser = await AgentService.getInstance().getCurrentUser();
        const widgetListPreference = currentUser.Preferences.find((p) => p.ID === 'ContextWidgetLists');
        if (widgetListPreference && widgetListPreference.Value) {
            try {
                const value = JSON.parse(widgetListPreference.Value);
                const contextLists = value[this.descriptor.contextId];
                if (contextLists) {
                    widgets = contextLists[contextWidgetList] || [];
                }
            } catch (error) {
                console.error(error);
            }
        }

        return widgets;
    }

    private mergeWidgetLists(
        contextWidgets: ConfiguredWidget[], userWidgets: Array<string | ConfiguredWidget> = []
    ): ConfiguredWidget[] {
        const widgets: ConfiguredWidget[] = userWidgets.length ? [] : contextWidgets;

        userWidgets.forEach((w) => {
            if (typeof w === 'string') {
                const widget = contextWidgets.find((cw) => cw.instanceId === w);
                if (widget) {
                    widgets.push(widget);
                }
            } else {
                widgets.push(w);
            }
        });

        return widgets;
    }

    public toggleSidebarWidget(instanceId: string): void {
        if (instanceId) {
            let sidebar = this.configuration.sidebars.find((s) => s.instanceId === instanceId);
            if (!sidebar) {
                sidebar = this.configuration.explorer.find((s) => s.instanceId === instanceId);
            }
            if (sidebar) {
                const index = this.openSidebarWidgets.findIndex((s) => s === instanceId);
                if (index !== -1) {
                    this.openSidebarWidgets.splice(index, 1);
                } else {
                    this.openSidebarWidgets.push(instanceId);
                }
                this.setShownSidebarPreference();
            }
        }
    }

    private setShownSidebarPreference(): void {
        ClientStorageService.setOption(
            `${this.configuration.id}-context-open-sidebar-widgets`,
            this.openSidebarWidgets ? this.openSidebarWidgets.map((s) => s).join('###') : ''
        );
    }

    public isSidebarWidgetOpen(instanceId: string): boolean {
        return this.openSidebarWidgets.some((s) => s === instanceId);
    }

    public toggleSidebar(open: boolean = false, left: boolean = false, setOption: boolean = true): void {
        if (setOption) {
            ClientStorageService.setOption(
                `${this.configuration.id}-context-opened-sidebar-${left ? 'left' : 'right'}`,
                open.toString()
            );
        }
        this.listeners.forEach((l) => left ? l.sidebarLeftToggled() : l.sidebarRightToggled());
    }

    public isSidebarOpen(left: boolean = false): boolean {
        const option = ClientStorageService.getOption(`${this.configuration.id}-context-opened-sidebar-${left ? 'left' : 'right'}`);
        if (option && (option === 'false' || option === '0')) {
            return false;
        }
        return true;
    }

    public async getConfiguredWidget(instanceId: string): Promise<ConfiguredWidget> {
        let configuration: ConfiguredWidget;

        if (this.configuration) {
            configuration = await this.getUserWidgetConfiguration(instanceId);

            if (!configuration) {
                configuration = this.configuration.explorer.find((e) => e.instanceId === instanceId);
            }

            if (!configuration) {
                configuration = this.configuration.sidebars.find((e) => e.instanceId === instanceId);
            }

            if (!configuration) {
                configuration = this.configuration.overlays.find((o) => o.instanceId === instanceId);
            }

            if (!configuration) {
                configuration = this.configuration.lanes.find((lw) => lw.instanceId === instanceId);
            }

            if (!configuration) {
                configuration = this.configuration.content.find((cw) => cw.instanceId === instanceId);
            }

            if (!configuration) {
                configuration = this.configuration.others.find((cw) => cw.instanceId === instanceId);
            }
        }

        if (configuration && Array.isArray(configuration.permissions)) {
            const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(configuration.permissions);
            if (!allowed) {
                return null;
            }
        }

        return configuration;
    }

    private async getUserWidgetConfiguration(instanceId: string): Promise<ConfiguredWidget> {
        let widget: ConfiguredWidget;

        const currentUser = await AgentService.getInstance().getCurrentUser();
        const widgetListPreference = currentUser.Preferences.find((p) => p.ID === 'ContextWidgetLists');
        if (widgetListPreference && widgetListPreference.Value) {
            const value = JSON.parse(widgetListPreference.Value);
            const contextLists = value[this.descriptor.contextId];
            if (contextLists) {
                for (const contextWidgetList in contextLists) {
                    if (Array.isArray(contextLists[contextWidgetList])) {
                        const widgets: Array<string | ConfiguredWidget> = contextLists[contextWidgetList];

                        widget = widgets
                            .filter((w) => typeof w !== 'string')
                            .map((w): ConfiguredWidget => w as ConfiguredWidget)
                            .find((w) => w.instanceId === instanceId);

                        if (widget) {
                            break;
                        }
                    }
                }
            }
        }

        return widget;
    }

    public async getWidgetConfiguration<T = WidgetConfiguration>(instanceId: string): Promise<T> {
        const configuredWidget = await this.getConfiguredWidget(instanceId);
        return configuredWidget ? configuredWidget.configuration as any : null;
    }

    public getContextSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        if (this.configuration) {
            const sidebarRight = this.configuration.sidebars.find((sw) => sw.instanceId === instanceId);
            widgetType = sidebarRight ? WidgetType.SIDEBAR : undefined;

            if (!widgetType) {
                const sidebarLeft = this.configuration.explorer.find((ex) => ex.instanceId === instanceId);
                widgetType = sidebarLeft ? WidgetType.SIDEBAR : undefined;
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

    public async reloadObjectList(objectType: KIXObjectType | string, silent: boolean = false): Promise<void> {
        return;
    }

    private loadingPromise: Promise<any>;
    protected async loadDetailsObject<T extends KIXObject>(
        objectType: KIXObjectType | string, loadingOptions: KIXObjectLoadingOptions = null,
        objectSpecificLoadingOptions: KIXObjectSpecificLoadingOptions = null,
        silent: boolean = true, cache?: boolean, forceIds?: boolean
    ): Promise<T> {
        if (!this.loadingPromise) {
            this.loadingPromise = new Promise<T>(async (resolve, reject) => {
                let object: T;

                if (this.objectId) {
                    const objects = await KIXObjectService.loadObjects<T>(
                        objectType, [Number(this.objectId)], loadingOptions, objectSpecificLoadingOptions,
                        silent, cache, forceIds
                    ).catch((error) => {
                        console.error(error);
                        return [];
                    });

                    object = objects?.length ? objects[0] : null;
                }
                this.loadingPromise = null;
                resolve(object);
            });
        }
        return this.loadingPromise;
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        for (const extension of this.contextExtensions) {
            await extension.addStorableAdditionalInformation(this, contextPreference);
        }

        contextPreference[AdditionalContextInformation.DISPLAY_TEXT] = this.getAdditionalInformation(
            AdditionalContextInformation.DISPLAY_TEXT
        );

        contextPreference[AdditionalContextInformation.ICON] = JSON.stringify(
            this.getAdditionalInformation(AdditionalContextInformation.ICON)
        );
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        for (const extension of this.contextExtensions) {
            await extension.loadAdditionalInformation(this, contextPreference);
        }
        this.setAdditionalInformation(
            AdditionalContextInformation.DISPLAY_TEXT, contextPreference[AdditionalContextInformation.DISPLAY_TEXT]
        );

        const iconValue = contextPreference[AdditionalContextInformation.ICON];
        if (iconValue) {
            this.setAdditionalInformation(AdditionalContextInformation.ICON, JSON.parse(iconValue));
        }
    }

    public equals(contextId: string, objectId?: string | number, context?: Context): boolean {
        if (context) {
            contextId = context.contextId;
            objectId = context.getObjectId();
        }

        objectId = objectId ? objectId.toString() : null;
        const contextObjectId = this.getObjectId() ? this.getObjectId().toString() : null;

        return contextId === this.descriptor.contextId && objectId === contextObjectId;
    }

}
