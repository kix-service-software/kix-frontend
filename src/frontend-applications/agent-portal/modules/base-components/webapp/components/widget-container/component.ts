/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { WidgetSize } from '../../../../../model/configuration/WidgetSize';
import { ContextService } from '../../core/ContextService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TreeHandler, TreeNode, TreeService } from '../../core/tree';
import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../core/EventService';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { ContextEvents } from '../../core/ContextEvents';
import { BrowserUtil } from '../../core/BrowserUtil';
import { SysConfigService } from '../../../../sysconfig/webapp/core/SysConfigService';
import { SearchService } from '../../../../search/webapp/core/SearchService';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextWidgetList: string = null;
    private originalWidgets: ConfiguredWidget[];
    private modifiedWidgets: ConfiguredWidget[] = [];
    private searchBookmarksTreeHandler: TreeHandler;
    private contextTreeHandler: TreeHandler;

    public onCreate(input: any): void {
        super.onCreate(input, 'widget-container');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.widgets = [
            ...input.widgets
                ? input.widgets.filter((w) => w?.configuration)
                : []
        ];

        this.state.configurationMode = typeof input.configurationMode !== 'undefined'
            ? input.configurationMode
            : false;
        this.contextWidgetList = input.contextWidgetList;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        if (this.contextWidgetList) {
            this.state.customizable = this.context?.getConfiguration().customizable;
        }

        this.state.translations = await TranslationService.createTranslationObject(
            [
                'Translatable#Submit', 'Translatable#Save', 'Translatable#Cancel', 'Translatable#Add Table Widget'
            ]
        );

        this.modifiedWidgets = [...this.state.widgets];

        super.registerEventSubscriber(
            function (data: any): void {
                if (data.contextId !== this.context.contextId) return;
                if (this.state.configurationMode) {
                    this.disableConfigurationMode(data.cancel);
                } else {
                    this.enableConfigurationMode();
                }
            },
            [ApplicationEvent.TOGGLE_CONFIGURATION_MODE]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

    public isLarge(widget: ConfiguredWidget): boolean {
        return widget.size === WidgetSize.LARGE;
    }

    public async enableConfigurationMode(): Promise<void> {
        this.state.searchBookmarkTreeId = IdService.generateDateBasedId();
        const treeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler(this.state.searchBookmarkTreeId, treeHandler);
        await this.loadSearchTemplates();

        this.state.contextTreeId = IdService.generateDateBasedId();
        const contextTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler(this.state.contextTreeId, contextTreeHandler);
        await this.loadContextWidgets();

        this.originalWidgets = [...this.state.widgets.map((w) => this.copyWidget(w))];

        this.state.configurationMode = true;
    }

    private copyWidget(widget: ConfiguredWidget): ConfiguredWidget {
        return JSON.parse(BrowserUtil.stringifyJSON(widget));
    }

    private async loadSearchTemplates(): Promise<void> {
        const searchBookmarks = await SearchService.getInstance().getSearchBookmarks();

        const groupNodes: TreeNode[] = [];
        for (const b of searchBookmarks) {
            let groupNode = groupNodes.find((gn) => gn.id === b.group);
            if (!groupNode) {
                const label = await TranslationService.translate(b.group);
                groupNode = new TreeNode(b.group, label, 'kix-icon-folder');
                groupNode.expandOnClick = true;
                groupNode.expanded = true;
                groupNode.selectable = false;
                groupNodes.push(groupNode);
            }

            const title = await TranslationService.translate(b.title);
            const node = new TreeNode(b.actionData?.id, title, b.icon);
            groupNode.children.push(node);
        }

        this.searchBookmarksTreeHandler = TreeService.getInstance().getTreeHandler(this.state.searchBookmarkTreeId);
        if (this.searchBookmarksTreeHandler) {
            this.searchBookmarksTreeHandler.setTree(groupNodes, null, true);
        }
    }

    private async loadContextWidgets(): Promise<void> {
        let contextWidgets: ConfiguredWidget[] = this.context?.getConfiguration()[this.contextWidgetList];

        const nodes: TreeNode[] = [];
        if (Array.isArray(contextWidgets)) {
            contextWidgets = contextWidgets.filter(
                (cw) => !this.state.widgets.some((w) => w.instanceId === cw.instanceId)
            );
            for (const widget of contextWidgets) {
                let title = await TranslationService.translate(widget.configuration?.title);
                if (!title) {
                    const config = await SysConfigService.getInstance().getUIConfiguration(widget.configurationId);
                    title = await TranslationService.translate(config.title);
                }
                nodes.push(new TreeNode(widget.instanceId, title, widget.configuration?.icon));
            }
        }

        this.contextTreeHandler = TreeService.getInstance().getTreeHandler(this.state.contextTreeId);
        if (this.contextTreeHandler) {
            this.contextTreeHandler.setTree(nodes, null, true);
        }
    }

    public configurationChanged(modifiedWidget: ConfiguredWidget): void {
        const index = this.modifiedWidgets.findIndex((w) => w.instanceId === modifiedWidget.instanceId);
        if (index !== -1) {
            this.modifiedWidgets.splice(index, 1);
        }
        this.modifiedWidgets.push(modifiedWidget);
    }

    public async saveWidgets(): Promise<void> {
        await ContextService.getInstance().saveUserWidgetList(
            this.context, this.state.widgets.map((w) => w.instanceId), this.modifiedWidgets, this.contextWidgetList
        );

        EventService.getInstance().publish(
            ContextEvents.CONTEXT_USER_WIDGETS_CHANGED, {
            widgets: [...this.modifiedWidgets], contextId: this.context.contextId
        });
        EventService.getInstance().publish(
            ApplicationEvent.TOGGLE_CONFIGURATION_MODE,
            { cancel: false, contextId: this.context.contextId }
        );
    }

    public cancel(): void {
        EventService.getInstance().publish(
            ApplicationEvent.TOGGLE_CONFIGURATION_MODE,
            { cancel: true, contextId: this.context.contextId }
        );
    }

    public disableConfigurationMode(cancel: boolean): void {
        TreeService.getInstance().removeTreeHandler(this.state.searchBookmarkTreeId);
        TreeService.getInstance().removeTreeHandler(this.state.contextTreeId);

        if (cancel) {
            this.state.widgets = this.originalWidgets;
            this.state.widgets.forEach((widget) => {
                const originalWidget = this.originalWidgets.find((w) => w.instanceId === widget.instanceId);
                widget.configuration = originalWidget.configuration;
            });
        } else {
            this.state.widgets = [...this.modifiedWidgets];
        }

        this.state.configurationMode = false;
    }

    public async addSearchbookmarkWidget(): Promise<void> {
        if (this.searchBookmarksTreeHandler) {
            const nodes = this.searchBookmarksTreeHandler.getSelectedNodes();
            if (nodes.length) {
                const widget = await SearchService.getInstance().createSearchTableWidget(nodes[0].id, nodes[0].label);
                if (widget) {
                    this.state.widgets.push(widget);
                    this.modifiedWidgets.push(widget);
                    this.searchBookmarksTreeHandler.selectNone();
                    (this as any).setStateDirty('widgets');
                }
            }
        }
    }

    public async addContextWidget(): Promise<void> {
        if (this.contextTreeHandler) {
            const nodes = this.contextTreeHandler.getSelectedNodes();
            if (nodes.length) {
                const widget = await this.context?.getConfiguredWidget(nodes[0].id);
                if (widget) {
                    // Update state widgets
                    const stateWidgetIndex = this.state.widgets.findIndex((sw) => {
                        sw.instanceId === widget.instanceId;
                    });
                    if (stateWidgetIndex === -1) {
                        this.state.widgets.push(widget);
                    } else {
                        this.state.widgets[stateWidgetIndex] = widget;
                    }
                    // Update modified widgets
                    const modifiedWidgetIndex = this.modifiedWidgets.findIndex((sw) => {
                        sw.instanceId === widget.instanceId;
                    });
                    if (modifiedWidgetIndex === -1) {
                        this.modifiedWidgets.push(widget);
                    } else {
                        this.modifiedWidgets[modifiedWidgetIndex] = widget;
                    }
                    // Update finished
                    this.contextTreeHandler.selectNone();
                    await this.loadContextWidgets();
                    (this as any).setStateDirty('widgets');
                }
            }
        }
    }

    // Drag and Drop

    public allowDrop(widget: ConfiguredWidget, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.dragOverInstanceId = widget?.instanceId;
    }

    public drag(widget: ConfiguredWidget, event: any): void {
        if (event.srcElement?.id === `widget-frame-${widget.instanceId}${this.state.componentId}`) {
            event.dataTransfer.setData('text', widget.instanceId);
        } else {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    public drop(widget: ConfiguredWidget, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.dragOverInstanceId = null;

        const instanceId = event.dataTransfer.getData('text');

        const oldIndex = this.state.widgets.findIndex((w) => w.instanceId === instanceId);
        const newIndex = this.state.widgets.findIndex((w) => w.instanceId === widget.instanceId);

        const removedWidget = this.state.widgets.splice(oldIndex, 1);

        this.state.widgets.splice(newIndex, 0, removedWidget[0]);

        (this as any).setStateDirty('widgets');
        (this as any).emit('widgetsChanged', this.state.widgets);
    }

    public async removeWidget(widget: ConfiguredWidget): Promise<void> {
        let index = this.state.widgets.findIndex((w) => w.instanceId === widget.instanceId);
        if (index !== -1) {
            this.state.widgets.splice(index, 1);
        }

        index = this.modifiedWidgets.findIndex((w) => w.instanceId === widget.instanceId);
        if (index !== -1) {
            this.modifiedWidgets.splice(index, 1);
        }

        await this.loadContextWidgets();
        (this as any).setStateDirty('widgets');
        (this as any).emit('widgetsChanged', this.state.widgets);
    }

    public toggleConfigurationMode(): void {
        if (this.state.configurationMode) {
            this.disableConfigurationMode(true);
        } else {
            this.enableConfigurationMode();
        }
    }

}

module.exports = Component;
