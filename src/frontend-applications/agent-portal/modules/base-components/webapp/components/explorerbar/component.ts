/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';

class Component {

    private state: ComponentState;
    private contextListernerId: string;
    private contextServiceListernerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('explorer-');
        this.contextServiceListernerId = IdService.generateDateBasedId('explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType || 'MAIN';
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
            this.state.isExplorerBarExpanded = context.explorerBarExpanded;
            this.state.explorer = context.getExplorer() || [];
            if (this.state.explorer.length) {
                context.registerListener(this.contextListernerId, {
                    sidebarToggled: () => { return; },
                    explorerBarToggled: async () => {
                        const activeContext = ContextService.getInstance().getActiveContext();
                        const structur = activeContext.getAdditionalInformation('STRUCTURE');
                        const explorerStructur = structur ? [...structur] : [];
                        if (explorerStructur && !!explorerStructur.length) {
                            this.state.explorerStructurStringLastElement = await TranslationService.translate(
                                explorerStructur.pop());
                            this.state.explorerStructurString = !!explorerStructur.length ?
                                explorerStructur.join(' | ') + ' | ' : '';
                        }
                        this.state.isExplorerBarExpanded = context.explorerBarExpanded;
                    },
                    objectChanged: () => { return; },
                    objectListChanged: () => { return; },
                    filteredObjectListChanged: () => { return; },
                    scrollInformationChanged: () => { return; },
                    additionalInformationChanged: () => { return; }
                });
            }
            (this as any).setStateDirty('explorer');
        }
    }

    public getExplorerTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

    public isExplorerBarExpanded(instanceId: string): boolean {
        const context = ContextService.getInstance().getActiveContext();
        return context.explorerBarExpanded;
    }

    public toggleExplorerBar(): void {
        ContextService.getInstance().getActiveContext().toggleExplorerBar();
    }
}

module.exports = Component;
