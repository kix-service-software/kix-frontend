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
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

declare const bootstrap: any;

export class Component extends AbstractMarkoComponent<ComponentState> {
    private observer: ResizeObserver;
    private actionList: IAction[];
    private actionsToShow: Array<ActionGroup | IAction>;

    public listenerInstanceId: string;
    public fontSize: number;
    public expansionWidth: number;

    private resizeTimeout: ReturnType<typeof setTimeout>;
    private lastWrapperWidth = 0;
    private lastContentWidth = 0;
    private observeParent: boolean;
    private initialOpenDropdown: boolean;
    private initialized: boolean;
    private observe: boolean;

    public onCreate(input: any): void {
        super.onCreate(input, 'action-list');
        this.state = new ComponentState();
        this.fontSize = BrowserUtil.getBrowserFontsize();
        this.expansionWidth = 3 * this.fontSize;
        this.listenerInstanceId = input.instanceId || this.listenerInstanceId;

        this.actionList = [];
        this.actionsToShow = [];

        this.observeParent = super.getInputValue(input.observeParent, true);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.initialOpenDropdown = super.getInputValue(input.initialOpenDropdown);
        this.state.displayText = super.getInputValue(input.displayText, true);

        this.actionList = input.list || [];

        if (this.initialized && this.actionList?.length && this.actionListChanged()) {
            this.updateActionList();
        }
    }

    // eslint-disable-next-line max-lines-per-function
    public async onMount(): Promise<void> {
        await super.onMount();

        this.actionsToShow = await ActionFactory.getActionList(this.actionList);

        if (this.listenerInstanceId) {
            if (this.context) {
                this.context.widgetService.registerActionListener({
                    listenerInstanceId: this.listenerInstanceId,
                    actionDataChanged: function (): void {
                        (this as any).setStateDirty('listDefault');
                        (this as any).setStateDirty('listExpansion');
                    }.bind(this),
                    actionsChanged: this.actionsChanged.bind(this)
                });
            }
            else {
                WidgetService.getInstance().registerActionListener({
                    listenerInstanceId: this.listenerInstanceId,
                    actionDataChanged: function (): void {
                        (this as any).setStateDirty('listDefault');
                        (this as any).setStateDirty('listExpansion');
                    }.bind(this),
                    actionsChanged: this.actionsChanged.bind(this)
                });
            }
            await this.actionsChanged();
            if (this.observeParent) {
                this.prepareObserver();
            }
        } else if (this.actionsToShow.length) {
            this.state.listDefault = [...this.actionsToShow];
            this.prepareActionLists().then(() => {
                if (this.observeParent) {
                    this.prepareObserver();
                }
                this.initialized = true;
            });
        }

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Action list'
        ]);
    }

    public onDestroy(): void {
        super.onDestroy();

        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.context) {
            this.context.widgetService.unregisterActionListener(this.listenerInstanceId);
        }
        else {
            WidgetService.getInstance().unregisterActionListener(this.listenerInstanceId);
        }

        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private prepareObserver(): void {
        if (!window.ResizeObserver) {
            return;
        }

        const wrapper: HTMLElement = (this as any).getEl(this.state.key + '-action-list-wrapper');
        const actionListElement: HTMLElement = (this as any).getEl(this.state.key + '-action-list');

        if (!wrapper || !actionListElement) {
            return;
        }

        this.lastWrapperWidth = wrapper.offsetWidth;
        this.lastContentWidth = actionListElement.scrollWidth;

        this.observer = new ResizeObserver(() => this.handleObservedParent(actionListElement, wrapper));
        this.observer.observe(wrapper);
        this.observer.observe(actionListElement);

        this.observe = true;
    }

    // eslint-disable-next-line max-lines-per-function
    private handleObservedParent(actionListElement, wrapper): void {
        if (!this.observe || !this.actionsToShow || !this.actionsToShow.length) {
            return;
        }

        if (!wrapper.isConnected || !actionListElement.isConnected) {
            if (this.observer) {
                this.observer.disconnect();
            }
            return;
        }

        const wrapperWidth = wrapper.offsetWidth;
        const contentWidth = actionListElement.scrollWidth;

        if (!wrapperWidth || !contentWidth) {
            return;
        }

        const wrapperChanged = wrapperWidth !== this.lastWrapperWidth;
        const growCheck = 5;
        const contentGrew = contentWidth > this.lastContentWidth &&
            contentWidth > wrapperWidth + growCheck;

        this.lastWrapperWidth = wrapperWidth;
        this.lastContentWidth = contentWidth;

        if (wrapperChanged || contentGrew) {
            actionListElement.classList.add('opacity-0');

            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                this.prepareActionLists();
            }, 150);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    public async prepareActionLists(): Promise<void> {
        // remove the observer to prevent resize trigger
        if (this.observer) {
            this.observe = false;
        }

        const actionListElement = await BrowserUtil.retry(
            this.getActionListElement.bind(this), [], 5, 10
        ).catch(() => null);

        const parent = actionListElement?.parentElement as HTMLElement | null;
        const maxWidth = parent?.offsetWidth || 0;

        if (!maxWidth) {
            return;
        }

        actionListElement.classList.add('opacity-0');

        (this as any).once('update', () => {
            // use short timeout to make sure DOM update is done
            // else some actions may be still in extension list and return wrong width
            setTimeout(async () => {
                this.calculateActionLists(maxWidth, actionListElement);
            }, 50);
        });
        this.state.listDefault = [...this.actionsToShow];
        this.state.listExpansion = [];
        (this as any).setStateDirty();
    }

    private async calculateActionLists(maxWidth: number, actionListElement: any): Promise<void> {
        const listDefault: Array<ActionGroup | IAction> = [];
        const listExpansion: Array<ActionGroup | IAction> = [];

        if (this.actionsToShow.length) {
            let actionsWidth = 0;

            for (const action of this.actionsToShow) {
                const actionElement = await BrowserUtil.retry(
                    this.getActionElement.bind(this), [`${this.state.key}${action['key']}`, action.text], 5, 10
                ).catch(() => null);
                if (actionElement) {
                    const width = actionElement?.offsetWidth || ((this.state.displayText ? 16 : 3) * this.fontSize);

                    if (!listExpansion.length && actionsWidth + width < maxWidth) {
                        listDefault.push(action);
                        actionsWidth += width;
                    } else {
                        listExpansion.push(action);
                    }
                };
            }

            if (
                listDefault.length
                && listExpansion.length
                && (actionsWidth + this.expansionWidth) > maxWidth
            ) {
                const removedElement = listDefault.pop();
                if (removedElement) {
                    listExpansion.unshift(removedElement);
                }
            }
        }

        this.state.listDefault = listDefault;
        this.state.listExpansion = listExpansion;
        (this as any).setStateDirty();

        actionListElement.classList.remove('opacity-0');

        this.lastContentWidth = actionListElement.scrollWidth;

        if (this.initialOpenDropdown) {
            setTimeout(function (): void {
                const dropdownElement = (this as any).getEl(`${this.state.key}action-list-expansion-button`);
                const dropdown = new bootstrap.Dropdown(dropdownElement);
                dropdown?.show();
            }.bind(this), 50);
        }

        // register new observer
        setTimeout(() => this.observe = true, 100);
    }

    private async getActionListElement(): Promise<HTMLElement> {
        const actionListElement: HTMLElement = (this as any).getEl(this.state.key + '-action-list');
        if (!actionListElement) {
            throw Error('no actionListElement');
        }

        if (!actionListElement.offsetParent) {
            throw Error('no offsetParent');
        }

        return actionListElement;
    }

    private async getActionElement(key: string, actionText: string = ''): Promise<HTMLElement> {
        const actionElement: HTMLElement = (this as any).getEl(key);
        if (!actionElement) {
            throw Error(`No actionElement found (${actionText})`);
        }
        return actionElement;
    }

    public async actionsChanged(): Promise<void> {
        const actions = this.context
            ? this.context.widgetService.getRegisteredActions(this.listenerInstanceId)
            : WidgetService.getInstance().getRegisteredActions(this.listenerInstanceId);

        if (actions) {
            this.actionList = actions[0];
            this.actionsToShow = await ActionFactory.getActionList(this.actionList);
            this.state.displayText = actions[1];
            this.prepareActionLists();
        }
    }

    private async updateActionList(): Promise<void> {
        this.state.prepared = false;
        this.actionsToShow = await ActionFactory.getActionList(this.actionList);
        this.prepareActionLists();
    }

    private actionListChanged(): boolean {
        const actionListIds = this.actionList.map((a) => a.id);
        const actionsToShowListIds = this.actionsToShow.reduce((acc, curr) => {
            if (curr instanceof ActionGroup) {
                return [...acc, ...curr.actions.map((a) => a.id)];
            } else {
                return [...acc, curr.id];
            }
        }, []);

        if (actionListIds.length !== actionsToShowListIds.length) return true;

        const set = new Set(actionListIds);
        return !actionsToShowListIds.every((id) => set.has(id));
    }

    public actionListClicked(event: any): any {
        (this as any).emit('actionListClicked');
    }
}

module.exports = Component;
