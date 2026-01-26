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
    private prepareTimeout: ReturnType<typeof setTimeout>;
    private visibleTimeout: ReturnType<typeof setTimeout>;
    private observerTimeout: ReturnType<typeof setTimeout>;
    private initialRefreshTimeout: ReturnType<typeof setTimeout>;
    private actionPreparationRunning = false;
    private lastWrapperWidth = 0;
    private lastContentWidth = 0;
    private observeParent: boolean;
    private initialOpenDropdown: boolean;

    public onCreate(input: any): void {
        super.onCreate(input, 'action-list');
        this.state = new ComponentState();
        this.fontSize = BrowserUtil.getBrowserFontsize();
        this.expansionWidth = 3 * this.fontSize;
        this.listenerInstanceId = input.instanceId || this.listenerInstanceId;

        this.actionList = [];
        this.actionsToShow = [];
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.observeParent = input.observeParent !== null && typeof input.observeParent === 'boolean'
            ? input.observeParent
            : true;

        this.initialOpenDropdown = input.initialOpenDropdown;

        this.state.displayText =
            typeof input.displayText !== 'undefined' ? input.displayText : true;
        this.actionList = input.list || [];
    }

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
        } else if (this.actionsToShow.length) {
            this.prepareActionLists();
        }

        this.state.prepared = true;

        if (this.observeParent) {
            this.observerTimeout = setTimeout(this.prepareObserver.bind(this), 150);
            this.initialRefreshTimeout = setTimeout(function (): void {
                if (!this.actionPreparationRunning && this.actionsToShow?.length) {
                    this.prepareActionLists();
                }
            }.bind(this), 600);
        }

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Action-list'
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
        if (this.prepareTimeout) {
            clearTimeout(this.prepareTimeout);
        }
        if (this.visibleTimeout) {
            clearTimeout(this.visibleTimeout);
        }
        if (this.observerTimeout) {
            clearTimeout(this.observerTimeout);
        }
        if (this.initialRefreshTimeout) {
            clearTimeout(this.initialRefreshTimeout);
        }
    }

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

        this.observer = new ResizeObserver(() => {
            if (!this.actionsToShow || !this.actionsToShow.length || this.actionPreparationRunning) {
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
                    this.resizeTimeout = null;
                }, 150);
            }
        });

        this.observer.observe(wrapper);
        this.observer.observe(actionListElement);
    }

    public prepareActionLists(): void {
        if (this.visibleTimeout) {
            clearTimeout(this.visibleTimeout);
            this.visibleTimeout = null;
        }
        if (this.prepareTimeout) {
            clearTimeout(this.prepareTimeout);
        }

        const actionListElement: HTMLElement = (this as any).getEl(this.state.key + '-action-list');
        if (!actionListElement) {
            return;
        }

        if (!actionListElement.offsetParent) {
            this.visibleTimeout = setTimeout(this.prepareActionLists.bind(this), 200);
            return;
        }

        const parent = actionListElement.parentElement as HTMLElement | null;
        const maxWidth = parent?.offsetWidth || 0;

        if (!maxWidth) {
            return;
        }

        actionListElement.classList.add('opacity-0');

        this.actionPreparationRunning = true;
        this.state.listDefault = [...this.actionsToShow];
        this.state.listExpansion = [];
        (this as any).setStateDirty();

        this.prepareTimeout = setTimeout(function (): void {
            this.prepareTimeout = null;

            const listDefault: Array<ActionGroup | IAction> = [];
            const listExpansion: Array<ActionGroup | IAction> = [];

            if (this.actionsToShow.length) {
                let actionsWidth = 0;

                for (const action of this.actionsToShow) {
                    const element = (this as any).getEl(this.state.key + action['key']);
                    const width =
                        element?.offsetWidth ||
                        ((this.state.displayText ? 16 : 3) * this.fontSize);

                    if (actionsWidth + width < maxWidth) {
                        listDefault.push(action);
                        actionsWidth += width;
                    } else {
                        listExpansion.push(action);
                    }
                }

                if (
                    listDefault.length &&
                    listExpansion.length &&
                    (actionsWidth + this.expansionWidth) > maxWidth
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
            this.actionPreparationRunning = false;

            this.lastContentWidth = actionListElement.scrollWidth;

            if (this.initialOpenDropdown) {
                setTimeout(function (): void {
                    const dropdownElement = (this as any).getEl(`${this.state.key}action-list-expansion-button`);
                    const dropdown = new bootstrap.Dropdown(dropdownElement);
                    dropdown?.show();
                }.bind(this), 50);
            }
        }.bind(this), 200);
    }

    public async actionsChanged(): Promise<void> {
        let actions;
        if (this.context) {
            actions = this.context.widgetService.getRegisteredActions(this.listenerInstanceId);
        }
        else {
            actions = WidgetService.getInstance().getRegisteredActions(this.listenerInstanceId);
        }
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
}

module.exports = Component;
