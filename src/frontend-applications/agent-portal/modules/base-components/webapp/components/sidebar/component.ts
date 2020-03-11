/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Context } from '../../../../../model/Context';
import { ContextType } from '../../../../../model/ContextType';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';

class Component {

    private state: ComponentState;
    private contextListernerId: string;
    private contextServiceListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('sidebar-');
        this.contextServiceListernerId = IdService.generateDateBasedId('sidebar-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: this.contextServiceListernerId,
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                if (type === this.state.contextType) {
                    this.setContext(context);
                }
            },
            contextRegistered: () => { return; }
        });
        this.setContext(ContextService.getInstance().getActiveContext(this.state.contextType));
    }

    public onDestroy(): void {
        ContextService.getInstance().unregisterListener(this.contextServiceListernerId);
    }

    private setContext(context: Context): void {
        if (context) {
            context.registerListener(this.contextListernerId, {
                sidebarToggled: () => {
                    this.updateSidebars(context);
                },
                explorerBarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                additionalInformationChanged: () => { return; }
            });
        }
        this.updateSidebars(context);
    }

    private updateSidebars(context: Context): void {
        setTimeout(() => {
            this.state.showSidebar = context ? context.areSidebarsShown() : false;
            if (this.state.showSidebar) {
                this.state.sidebars = [...context.getSidebars(true)] || [];
                this.setShieldHeight(context);
            } else {
                this.state.sidebars = [];
            }
        }, 100);
    }

    public getSidebarTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? KIXModulesService.getComponentTemplate(config.widgetId) : undefined;
    }

    private setShieldHeight(context: Context): void {
        const shield = (this as any).getEl();
        if (shield && context) {
            const visible = getComputedStyle(shield).getPropertyValue('display');
            const sidebarArea = shield.nextElementSibling;
            if (visible && visible !== 'none' && sidebarArea) {
                const isDialogContext = context.getDescriptor().contextType === ContextType.DIALOG;
                setTimeout(() => {
                    const sidebarHeight = sidebarArea.getBoundingClientRect().height;
                    const formHeight = isDialogContext && shield.previousElementSibling
                        ? shield.previousElementSibling.getBoundingClientRect().height : 0;
                    const relevantHeight = sidebarHeight && sidebarHeight > formHeight
                        ? sidebarHeight : formHeight ? formHeight : null;
                    if (relevantHeight) {
                        const addHeight = isDialogContext ? '1rem' : '13.5rem';
                        shield.style.height = `calc(${relevantHeight}px + ${addHeight})`;
                    }
                }, 200);
            }
        }
    }
}

module.exports = Component;
