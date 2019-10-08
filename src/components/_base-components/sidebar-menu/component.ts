/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './SidebarMenuComponentState';
import { ContextService } from '../../../core/browser/context';
import { Context, ConfiguredWidget, ContextType } from '../../../core/model';
import { IdService } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class SidebarMenuComponent {

    private state: ComponentState;
    private contextListernerId: string;
    private contextServiceListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('sidebar-menu-');
        this.contextServiceListernerId = IdService.generateDateBasedId('sidebar-menu-');
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
                    this.setSidebarMenu(context);
                },
                explorerBarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                additionalInformationChanged: () => { return; }
            });
        }
        this.setSidebarMenu(context);
    }

    private async setSidebarMenu(context: Context): Promise<void> {
        if (context) {
            this.state.sidebars = Array.from(context ? (context.getSidebars() || []) : []);

            this.state.translations = await TranslationService.createTranslationObject(
                this.state.sidebars.map((s) => s.configuration.title)
            );
        }
    }

    private toggleSidebar(instanceId: string): void {
        ContextService.getInstance().getActiveContext(this.state.contextType).toggleSidebarWidget(instanceId);
    }

    private isShown(sidebar: ConfiguredWidget): boolean {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        const sidebars = context.getSidebars(true) || [];
        return (sidebars.findIndex((sb) => sb.instanceId === sidebar.instanceId) !== -1);
    }

}

module.exports = SidebarMenuComponent;
