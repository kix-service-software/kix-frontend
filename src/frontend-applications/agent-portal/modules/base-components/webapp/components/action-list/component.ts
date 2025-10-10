/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { IAction } from '../../core/IAction';
import { ActionFactory } from '../../core/ActionFactory';
import { ActionGroup } from '../../../model/ActionGroup';
import { BrowserUtil } from '../../core/BrowserUtil';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { EventService } from '../../core/EventService';
import { ContextEvents } from '../../core/ContextEvents';
import { Context } from 'mocha';
import { IdService } from '../../../../../model/IdService';

export class Component extends AbstractMarkoComponent<ComponentState> {
    private resizeTimeout: any = null;
    private prepareTimeout: any;
    private observer: ResizeObserver;
    private actionList: IAction[];
    private actionsToShow: Array<ActionGroup | IAction>;

    public listenerInstanceId: string;
    public fontSize: number;
    public expansionWidth: number;
    private contextSubscriber: IEventSubscriber;
    private observerTimeout: any;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.fontSize = BrowserUtil.getBrowserFontsize();
        this.expansionWidth = 3 * this.fontSize;
        this.listenerInstanceId = input.instanceId || this.listenerInstanceId;
    }

    public onInput(input: any): void {
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
        this.actionList = input.list || [];
        if (this.state.prepared && this.actionList.length) {
            this.initializeActionLists();
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.actionsToShow = await ActionFactory.getActionList(this.actionList);

        if (this.listenerInstanceId) {
            WidgetService.getInstance().registerActionListener({
                listenerInstanceId: this.listenerInstanceId,
                actionDataChanged: function (): void {
                    (this as any).setStateDirty('listDefault');
                    (this as any).setStateDirty('listExpansion');
                }.bind(this),
                actionsChanged: this.actionsChanged.bind(this)
            });
            await this.actionsChanged();
        } else if (this.actionsToShow.length) {
            this.prepareActionLists();
        }

        this.state.prepared = true;

        this.observerTimeout = setTimeout(() => this.prepareObserver(), 150);

        if (this.context) {
            this.contextSubscriber = {
                eventSubscriberId: this.listenerInstanceId || IdService.generateDateBasedId('action-list-'),
                eventPublished: function (data: Context, eventId: string): void {
                    if (data?.instanceId === this.context.instanceId) {
                        if (!this.observer) {
                            this.observerTimeout = setTimeout(() => this.prepareObserver(), 150);
                        }
                    } else {
                        if (this.observerTimeout) {
                            clearTimeout(this.observerTimeout);
                            this.observerTimeout = undefined;
                        }
                        if (this.observer) {
                            this.observer.disconnect();
                            this.observer = undefined;
                        }
                    }
                }.bind(this)
            };
            EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.contextSubscriber);
        }
    }

    public onDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }

        WidgetService.getInstance().unregisterActionListener(this.listenerInstanceId);
        if (this.contextSubscriber) {
            EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.contextSubscriber);
        }
    }

    private actionPreparationRunning = false;
    private prepareObserver(): void {
        if (window.ResizeObserver) {
            const rootElement: HTMLElement = (this as any).getEl(this.state.key + '-action-list-wrapper');
            const container = rootElement?.parentElement;
            const actionListElement: HTMLElement = (this as any).getEl(this.state.key + '-action-list');

            let containerWidth = container.offsetWidth;
            this.observer = new ResizeObserver((entries) => {
                if (
                    container.offsetWidth !== containerWidth &&
                    !this.actionPreparationRunning && this.actionsToShow.length
                ) {
                    // hide, so action do not visible overlap if container shrinks
                    actionListElement.classList.add('opacity-0');

                    if (this.resizeTimeout) {
                        clearTimeout(this.resizeTimeout);
                    }

                    this.resizeTimeout = setTimeout(() => {
                        containerWidth = container.offsetWidth;
                        this.prepareActionLists();
                        this.resizeTimeout = null;
                    }, 150);
                }
            });

            this.observer.observe(container);
            this.observerTimeout = undefined;
        }
    }

    private async initializeActionLists(): Promise<void> {
        this.actionsToShow = await ActionFactory.getActionList(this.actionList);
        this.prepareActionLists();
    }

    public prepareActionLists(): void {
        if (this.prepareTimeout) {
            window.clearTimeout(this.prepareTimeout);
        }

        const actionListElement: HTMLElement = (this as any).getEl(this.state.key + '-action-list');
        // only prepare if visible
        if (actionListElement.offsetParent) {

            const maxWidth = actionListElement?.parentElement?.offsetWidth || 0;

            // hide action during preparation
            actionListElement.classList.add('opacity-0');

            this.actionPreparationRunning = true;
            this.state.listDefault = [...this.actionsToShow];
            this.state.listExpansion = [];
            (this as any).setStateDirty();

            this.prepareTimeout = setTimeout(() => {
                this.prepareTimeout = null;
                const listDefault = [];
                const listExpansion = [];
                if (this.actionsToShow.length) {
                    let actionsWidth = 0;
                    for (const action of this.actionsToShow) {
                        const element = (this as any).getEl(this.state.key + action['key']);
                        const width = element?.offsetWidth || ((this.state.displayText ? 16 : 3) * this.fontSize);

                        if (actionsWidth + width < maxWidth) {
                            listDefault.push(action);
                            actionsWidth += width;
                        } else {
                            listExpansion.push(action);
                        }
                    }

                    // if list is wider with expansion button shown, move last action
                    if (listDefault.length && listExpansion.length && (actionsWidth + this.expansionWidth) > maxWidth) {
                        const removedElement = listDefault.pop();
                        listExpansion.unshift(removedElement);
                    }
                }
                this.state.listDefault = listDefault;
                this.state.listExpansion = listExpansion;
                (this as any).setStateDirty();
                actionListElement.classList.remove('opacity-0');
                this.actionPreparationRunning = false;
            }, 200);
        }
    }

    public async actionsChanged(): Promise<void> {
        const actions = WidgetService.getInstance().getRegisteredActions(this.listenerInstanceId);
        if (actions) {
            this.actionList = actions[0];
            this.actionsToShow = await ActionFactory.getActionList(this.actionList);
            this.state.displayText = actions[1];
            this.prepareActionLists();
        }
    }
    public actionListClicked(event: any): any {
        (this as any).emit('actionListClicked');
    }

    public preventDefault(event: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

}

module.exports = Component;
