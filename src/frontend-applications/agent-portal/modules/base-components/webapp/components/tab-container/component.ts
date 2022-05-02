/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TabContainerEvent } from '../../../../../modules/base-components/webapp/core/TabContainerEvent';
import { ContextType } from '../../../../../model/ContextType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { TabContainerEventData } from '../../../../../modules/base-components/webapp/core/TabContainerEventData';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { Context } from '../../../../../model/Context';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { ClientStorageService } from '../../core/ClientStorageService';
import { PlaceholderService } from '../../core/PlaceholderService';

class TabLaneComponent implements IEventSubscriber {

    public eventSubscriberId: string;
    public contextListenerId: string;
    public contextServiceListenerId: string;

    private state: ComponentState;

    private initialTabId: string;
    private tabIcons: Map<string, string | ObjectIcon>;
    private tabTitles: Map<string, string>;
    private hideSidebar: boolean;

    private id: string;
    private context: Context;
    private tabContainerPrefId: string;

    private keyDownEventFunction: () => {
        // do nothing ...
    };

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
        this.id = input.id;

        WidgetService.getInstance().setWidgetType('tab-widget', WidgetType.LANE);

        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TITLE, this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_ICON, this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TAB, this);
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.tabContainerPrefId = `${this.context?.descriptor?.contextId}-${this.context?.getObjectId()}-${this.id}-activetab`;
        const tabId = ClientStorageService.getOption(this.tabContainerPrefId);
        if (this.state.tabWidgets.length) {
            const object = await this.context?.getObject();
            for (const tab of this.state.tabWidgets) {
                const translatedTitle = await TranslationService.translate(tab.configuration?.title);
                const titleWithPlaceholder = await PlaceholderService.getInstance().replacePlaceholders(
                    translatedTitle, object
                );
                this.tabTitles.set(tab.instanceId, titleWithPlaceholder || translatedTitle);
            }

            if (tabId) {
                await this.tabClicked(this.state.tabWidgets.find((tw) => tw.instanceId === tabId), true);
            }
            if (!this.state.activeTab && this.initialTabId) {
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
                    if (oldContext && oldContext.descriptor.contextType === ContextType.DIALOG) {
                        oldContext.unregisterListener(this.contextListenerId);
                    }
                },
                contextRegistered: () => { return; }
            });
            this.prepareContext();
        }

        if (this.state.tabWidgets.length && this.state.activeTab && this.state.tabId) {
            const tab = this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId);
            if (tab && tab.instanceId !== this.state.activeTab.instanceId) {
                this.state.activeTab = tab;
            }
        }

        if (this.state.contextType === ContextType.DIALOG) {
            this.keyDownEventFunction = this.keydown.bind(this);
            document.body.addEventListener('keydown', this.keyDownEventFunction, false);
        }

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TITLE, this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_ICON, this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TAB, this);
        const context: Context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.unregisterListener(this.contextListenerId);
        }
        ContextService.getInstance().unregisterListener(this.contextServiceListenerId);

        if (this.state.contextType === ContextType.DIALOG && this.keyDownEventFunction) {
            document.body.removeEventListener('keydown', this.keyDownEventFunction, false);
        }
    }

    public async tabClicked(tab: ConfiguredWidget, silent?: boolean): Promise<void> {
        this.state.activeTab = tab;
        this.state.activeTabTitle = this.state.activeTab && this.state.activeTab.configuration
            ? this.state.activeTab.configuration.title
            : '';
        if (tab) {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                const object = await context.getObject(context.descriptor.kixObjectTypes[0]);

                this.state.contentActions = await ActionFactory.getInstance().generateActions(
                    tab.configuration ? tab.configuration.actions : [], [object]
                );
            }
        }

        ClientStorageService.setOption(this.tabContainerPrefId, this.state.activeTab?.instanceId);

        if (!silent) {
            (this as any).emit('tabChanged', tab);
        }
    }

    public getWidgetTemplate(): any {
        return this.state.activeTab && this.state.activeTab.configuration
            ? KIXModulesService.getComponentTemplate(this.state.activeTab.configuration.widgetId)
            : undefined;
    }

    private prepareContext(
        context: Context = ContextService.getInstance().getActiveContext()
    ): void {
        context.registerListener(this.contextListenerId, {
            sidebarRightToggled: () => {
                // this.state.showSidebar = context.areSidebarsRightShown();
            },
            sidebarLeftToggled: (): void => { return; },
            objectChanged: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: (): void => { return; }
        });
        this.setSidebars();
    }

    private async setSidebars(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const sidebars = await context?.getSidebarsRight() || [];
        this.state.hasSidebars = sidebars.length > 0;
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
                if (data.icon) {
                    this.tabIcons.set(tab.instanceId, data.icon);
                }
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
            const tab = this.state.tabWidgets.find((t) => t.configuration && t.configuration.widgetId === data.tabId);
            if (tab) {
                this.tabClicked(tab);
            }
        }
    }

    public getTitle(tab: WidgetConfiguration): string {
        const title = tab.configuration ? (tab.configuration as WidgetConfiguration).title : '';
        return this.tabTitles.has(tab.instanceId)
            ? this.tabTitles.get(tab.instanceId)
            : title;
    }

    public getIcon(tab: WidgetConfiguration): string | ObjectIcon {
        const icon = tab.configuration ? (tab.configuration as WidgetConfiguration).icon : null;
        return this.tabIcons.has(tab.instanceId)
            ? this.tabIcons.get(tab.instanceId)
            : icon;
    }

    public keydown(event: any): void {
        if (
            this.state.tabWidgets && this.state.tabWidgets.length > 1
            && (event.key === 'ArrowUp' || event.key === 'ArrowDown')
            && event.ctrlKey
        ) {
            const index = this.state.tabWidgets.findIndex((tw) => tw.instanceId === this.state.activeTab.instanceId);
            let nextTab: ConfiguredWidget;

            if (event.key === 'ArrowUp') {
                nextTab = index > 0
                    ? this.state.tabWidgets[index - 1]
                    : this.state.tabWidgets[this.state.tabWidgets.length - 1];
            } else {
                nextTab = index < this.state.tabWidgets.length - 1
                    ? this.state.tabWidgets[index + 1]
                    : this.state.tabWidgets[0];
            }

            this.tabClicked(nextTab);
        }
    }
}

module.exports = TabLaneComponent;
