/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IActionListener } from '../../../../../modules/base-components/webapp/core/IActionListener';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { IAction } from '../../core/IAction';

export class Component implements IActionListener {

    private state: ComponentState;
    private resizeTimeout: any = null;

    public listenerInstanceId: string;

    private prepareTimeout;

    private observer: ResizeObserver;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerInstanceId = input.instanceId;
        this.initActionList(input);
    }

    public onInput(input: any): void {
        this.initActionList(input);
    }

    private async initActionList(input: any): Promise<void> {
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
        this.state.prepared = false;

        if (Array.isArray(input.list) && input.list.length) {
            await this.setActionList(input.list);
        }
        this.state.prepared = true;

        this.prepareActionLists();
    }

    private async setActionList(actionList: IAction[]): Promise<void> {
        const actions = [];
        if (Array.isArray(actionList)) {
            const actionPromises = [];
            actionList.forEach((a) => actionPromises.push(a.canShow()));
            const actionsResults = await Promise.all(actionPromises);
            actionsResults.forEach((r, i) => {
                if (r) {
                    actions.push(actionList[i]);
                }
            });
        }

        this.state.actionList = actions;
    }

    public onMount(): void {
        document.addEventListener('click', (event) => {
            if (this.state.keepShow) {
                this.state.keepShow = false;
            } else {
                this.state.showListExpansion = false;
            }
        }, false);

        if (this.listenerInstanceId) {
            WidgetService.getInstance().registerActionListener(this);
            this.actionsChanged();
        } else {
            this.prepareActionLists();
        }

        this.prepareObserver();
    }

    public onDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private prepareObserver(): void {
        if (window.ResizeObserver) {
            this.observer = new ResizeObserver((entries) => {
                this.resizeThrottler();
            });
            const rootElement = (this as any).getEl();
            this.observer.observe(rootElement);
        }
    }

    private resizeThrottler(): void {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = null;
                this.prepareActionLists();
            }, 100);
        }
    }

    public prepareActionLists(): void {
        if (this.prepareTimeout) {
            window.clearTimeout(this.prepareTimeout);
        }
        this.prepareTimeout = setTimeout(() => {
            const actionListElement = (this as any).getEl('action-list');
            const listWidth = actionListElement ? actionListElement.scrollWidth : 0;
            if (this.state.actionList) {
                const actionWidth = (this.state.displayText ? 9.5 : 1.75) * this.getBrowserFontsize();
                const gapWith = 1.5 * this.getBrowserFontsize();
                let maxActions = this.state.actionList.length;
                while ((maxActions * actionWidth) + ((maxActions - 1) * gapWith) > listWidth && maxActions > 0) {
                    maxActions--;
                }
                this.state.listDefault = this.state.actionList.slice(0, maxActions);
                this.state.listExpansion = this.state.actionList.slice(maxActions);
            }
        }, 250);
    }

    private getBrowserFontsize(): number {
        const browserFontSizeSetting = window
            .getComputedStyle(document.getElementsByTagName('body')[0], null)
            .getPropertyValue('font-size');
        return Number(browserFontSizeSetting.replace('px', ''));
    }

    public toggleListExpansion(event: any): any {
        event.stopPropagation();
        this.state.showListExpansion = !this.state.showListExpansion;
        this.state.keepShow = !this.state.keepShow;
    }

    public async actionsChanged(): Promise<void> {
        const actions = WidgetService.getInstance().getRegisteredActions(this.listenerInstanceId);
        if (actions) {
            await this.setActionList(actions[0]);
            this.state.displayText = actions[1];
            this.prepareActionLists();
        }
    }

    public actionDataChanged(): void {
        (this as any).setStateDirty('listDefault');
        (this as any).setStateDirty('listExpansion');
    }
}

module.exports = Component;
