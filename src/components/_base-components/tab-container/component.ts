/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from '../../../core/browser/context';
import { TabContainerEvent, TabContainerEventData } from '../../../core/browser/components';
import { WidgetType, ConfiguredWidget, ObjectIcon, Context, ContextType } from '../../../core/model';
import { ComponentState } from './ComponentState';
import { WidgetService, ActionFactory, IdService } from '../../../core/browser';
import { IEventSubscriber, EventService } from '../../../core/browser/event';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { KIXModulesService } from '../../../core/browser/modules';

class TabLaneComponent implements IEventSubscriber {

    public eventSubscriberId: string;
    public contextListenerId: string;
    public contextServiceListenerId: string;

    private state: ComponentState;

    private initialTabId: string;
    private tabIcons: Map<string, string | ObjectIcon>;
    private tabTitles: Map<string, string>;
    private hideSidebar: boolean;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.tabWidgets);
        this.tabTitles = new Map();
        this.tabIcons = new Map();
        this.eventSubscriberId = IdService.generateDateBasedId('tab-container');
        this.contextListenerId = IdService.generateDateBasedId('tab-container');
        this.contextServiceListenerId = IdService.generateDateBasedId('tab-container');

        this.state.tabWidgets = input.tabWidgets ? input.tabWidgets : [];
        this.initialTabId = input.tabId;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.contextType = input.contextType;
        this.hideSidebar = typeof input.hideSidebar !== 'undefined' ? input.hideSidebar : false;

        WidgetService.getInstance().setWidgetType("tab-widget", WidgetType.LANE);

        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TITLE, this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_ICON, this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TAB, this);
    }

    public async onMount(): Promise<void> {
        if (this.state.tabWidgets.length) {
            this.state.translations = await TranslationService.createTranslationObject(
                this.state.tabWidgets.map((t) => t.configuration.title)
            );

            if (this.initialTabId) {
                await this.tabClicked(this.state.tabWidgets.find((tw) => tw.instanceId === this.initialTabId), true);
            }
            if (!this.state.activeTab) {
                await this.tabClicked(this.state.tabWidgets[0], true);
            }
        }

        if (this.state.contextType && this.state.contextType === ContextType.DIALOG && !this.hideSidebar) {
            ContextService.getInstance().registerListener({
                constexServiceListenerId: this.contextServiceListenerId,
                contextChanged: (
                    contextId: string, context: Context, type: ContextType, history, oldContext: Context
                ) => {
                    if (type === ContextType.DIALOG) {
                        this.prepareContext(context);
                    }
                    if (oldContext && oldContext.getDescriptor().contextType === ContextType.DIALOG) {
                        oldContext.unregisterListener(this.contextListenerId);
                    }
                },
                contextRegistered: () => { return; }
            });
            this.prepareContext();
            this.hideSidebarIfNeeded();
            window.addEventListener('resize', this.hideSidebarIfNeeded.bind(this), false);
            const sidebarTranslations = await TranslationService.createTranslationObject(
                ['Translatable#Close Sidebars']
            );
            this.state.translations = { ...this.state.translations, ...sidebarTranslations };
        }

        if (this.state.tabWidgets.length && this.state.activeTab && this.state.tabId) {
            const tab = this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId);
            if (tab && tab.instanceId !== this.state.activeTab.instanceId) {
                this.state.activeTab = tab;
            }
        }

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TITLE, this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_ICON, this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TAB, this);
        const context: Context = ContextService.getInstance().getActiveContext(this.state.contextType);
        if (context) {
            context.unregisterListener(this.contextListenerId);
        }
        ContextService.getInstance().unregisterListener(this.contextServiceListenerId);
        window.removeEventListener('resize', this.hideSidebarIfNeeded.bind(this), false);
    }

    public async tabClicked(tab: ConfiguredWidget, silent?: boolean): Promise<void> {
        this.state.activeTab = tab;
        this.state.activeTabTitle = this.state.activeTab ? this.state.activeTab.configuration.title : '';
        if (tab) {
            const context = ContextService.getInstance().getActiveContext(this.state.contextType);
            if (context) {
                const object = await context.getObject(context.getDescriptor().kixObjectTypes[0]);

                this.state.contentActions = await ActionFactory.getInstance().generateActions(
                    tab.configuration.actions, [object]
                );
            }
        }
        if (!silent) {
            (this as any).emit('tabChanged', tab);
        }
    }

    public getWidgetTemplate(): any {
        return this.state.activeTab
            ? KIXModulesService.getComponentTemplate(this.state.activeTab.configuration.widgetId)
            : undefined;
    }

    private prepareContext(
        context: Context = ContextService.getInstance().getActiveContext(this.state.contextType)
    ): void {
        context.registerListener(this.contextListenerId, {
            sidebarToggled: () => {
                this.state.showSidebar = context.isSidebarShown();
            },
            explorerBarToggled: () => { return; },
            objectChanged: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });
        this.setSidebars();
    }

    public hideSidebarIfNeeded(): void {
        const context: Context = ContextService.getInstance().getActiveContext(this.state.contextType);
        if (context &&
            context.isSidebarShown() &&
            window.innerWidth <= 1400
        ) {
            context.closeSidebar();
        }
    }

    private setSidebars(): void {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.hasSidebars = context ? context.getSidebars().length > 0 : false;
        this.state.showSidebar = context.isSidebarShown();
    }

    public isActiveTab(tabId: string): boolean {
        return this.state.activeTab && this.state.activeTab.instanceId === tabId;
    }

    public async eventPublished(data: TabContainerEventData, eventId: string): Promise<void> {
        if (eventId === TabContainerEvent.CHANGE_TITLE) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                const newTitle = await TranslationService.translate(data.title);
                this.tabTitles.set(tab.instanceId, newTitle);
                (this as any).setStateDirty('tabWidgets');
            }
        }
        if (eventId === TabContainerEvent.CHANGE_ICON) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                this.tabIcons.set(tab.instanceId, data.icon);
                (this as any).setStateDirty('tabWidgets');
            }
        }
        if (eventId === TabContainerEvent.CHANGE_TAB) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                this.tabClicked(tab);
            }
        }
    }

    public getTitle(tab: ConfiguredWidget): string {
        return this.tabTitles.has(tab.instanceId)
            ? this.tabTitles.get(tab.instanceId)
            : this.state.translations[tab.configuration.title];
    }

    public getIcon(tab: ConfiguredWidget): string | ObjectIcon {
        return this.tabIcons.has(tab.instanceId)
            ? this.tabIcons.get(tab.instanceId)
            : tab.configuration.icon;
    }
}

module.exports = TabLaneComponent;
