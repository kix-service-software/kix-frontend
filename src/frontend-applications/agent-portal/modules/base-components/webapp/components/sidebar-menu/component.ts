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
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';

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
            this.state.sidebars = Array.from(context.getSidebars() || []);

            this.state.translations = await TranslationService.createTranslationObject(
                [
                    'Translatable#Close Sidebars',
                    'Translatable#Open Sidebars',
                    ...this.state.sidebars.map((s) => s.configuration.title)
                ]
            );
        }
    }

    public toggleSidebar(instanceId: string): void {
        ContextService.getInstance().getActiveContext(this.state.contextType).toggleSidebarWidget(instanceId);
    }

    public isShown(sidebar: ConfiguredWidget): boolean {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        const sidebars = context.getSidebars(true) || [];
        return (sidebars.findIndex((sb) => sb.instanceId === sidebar.instanceId) !== -1);
    }

    public toggleAllSidebars(): void {
        const context: Context = ContextService.getInstance().getActiveContext(this.state.contextType);
        if (context) {
            if (context.areSidebarsShown()) {
                context.closeAllSidebars();
            } else {
                context.openAllSidebars();
            }
        }
    }

    public areSidebarsShown(): boolean {
        const context: Context = ContextService.getInstance().getActiveContext(this.state.contextType);
        return context && context.areSidebarsShown();
    }

}

module.exports = SidebarMenuComponent;
