/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IActionListener } from '../../../../../modules/base-components/webapp/core/IActionListener';
import { IdService } from '../../../../../model/IdService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import {
    AbstractContextServiceListener
} from '../../../../../modules/base-components/webapp/core/AbstractContextServiceListener';
import { IContextListener } from '../../../../../modules/base-components/webapp/core/IContextListener';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Context } from '../../../../../model/Context';
import { IAction } from '../../core/IAction';

export class Component implements IActionListener {

    private state: ComponentState;
    private resizeTimeout: any = null;

    public listenerInstanceId: string;

    private contextListernerId: string;
    private contextListener: ComponentContextListener = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerInstanceId = input.instanceId;
        this.contextListernerId = IdService.generateDateBasedId('action-list-');
        this.initActionList(input);
    }

    public onInput(input: any): void {
        this.initActionList(input);
    }

    private async initActionList(input: any): Promise<void> {
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
        this.state.prepared = true;

        if (Array.isArray(input.list) && input.list.length) {
            await this.setActionList(input.list);
        }

        setTimeout(() => this.prepareActionLists(), 100);
    }

    private async setActionList(actionList: IAction[]): Promise<void> {
        const actions = [];
        if (Array.isArray(actionList)) {
            for (const action of actionList) {
                const canShow = await action.canShow();
                if (canShow) {
                    actions.push(action);
                }
            }
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

        ContextService.getInstance().registerListener(new ComponentContextServiceListener(this));
        this.contextListener = new ComponentContextListener(this);

        window.addEventListener('resize', this.windowResizeThrottler.bind(this), false);
    }

    public setContext(context: Context): void {
        context.registerListener(this.contextListernerId, this.contextListener);
    }

    private windowResizeThrottler(): void {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = null;
                this.prepareActionLists();
            }, 66);
        }
    }

    public prepareActionLists(): void {
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
    }

    private getBrowserFontsize(): number {
        const browserFontSizeSetting = window
            .getComputedStyle(document.getElementsByTagName('body')[0], null)
            .getPropertyValue('font-size');
        return Number(browserFontSizeSetting.replace('px', ''));
    }

    public toggleListExpansion(): any {
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

// tslint:disable-next-line:max-classes-per-file
class ComponentContextServiceListener extends AbstractContextServiceListener {

    public constructor(private actionListComponent: Component) {
        super();
    }

    public contextChanged(contextId: string, context: Context): void {
        this.actionListComponent.setContext(context);
    }

}

// tslint:disable-next-line:max-classes-per-file
class ComponentContextListener implements IContextListener {

    public constructor(private actionListComponent: Component) { }

    public sidebarRightToggled(): void {
        setTimeout(() => {
            this.actionListComponent.prepareActionLists();
        }, 50);
    }

    public sidebarLeftToggled(): void {
        setTimeout(() => {
            this.actionListComponent.prepareActionLists();
        }, 50);
    }

    public objectChanged(objectId: string | number, object: KIXObject): void {
        return;
    }

    public objectProvided(objectId: string | number, object: KIXObject): void {
        return;
    }

    public objectListChanged(objectType: KIXObjectType | string, objectList: KIXObject[]): void {
        return;
    }

    public filteredObjectListChanged(objectType: KIXObjectType | string, objectList: KIXObject[]): void {
        return;
    }

    public scrollInformationChanged(): void {
        return;
    }

    public additionalInformationChanged(): void {
        return;
    }
}


module.exports = Component;
