/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { AdminContext } from '../../core/AdminContext';
import { ContextType } from '../../../../../model/ContextType';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { AdminModule } from '../../../model/AdminModule';
import { AdministrationSocketClient } from '../../core';
import { AdminModuleCategory } from '../../../model/AdminModuleCategory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'admin-module-context-service-listener',
            contextChanged: (contextId: string, c: AdminContext, type: ContextType, history: boolean) => {
                if (contextId === AdminContext.CONTEXT_ID && c.adminModuleId) {
                    this.moduleChanged();
                }
            },
            contextRegistered: () => { return; }
        });
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        context.registerListener('admin-module-context-listener', {
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: this.moduleChanged.bind(this),
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });
    }

    public onDestroy(): void {
        ContextService.getInstance().unregisterListener('admin-module-context-service-listener');
    }

    public async moduleChanged(): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const categories = await AdministrationSocketClient.getInstance().loadAdminCategories();
        const module = this.findAdminModule(categories, context.adminModuleId);
        if (module) {
            this.state.template = KIXModulesService.getComponentTemplate(module.componentId);
        }
    }

    private findAdminModule(modules: Array<AdminModuleCategory | AdminModule>, moduleId: string): AdminModule {
        for (const module of modules) {
            if (module instanceof AdminModuleCategory) {
                if (Array.isArray(module.modules)) {
                    let found = this.findAdminModule(module.modules, moduleId);
                    if (found) {
                        return found;
                    } else if (Array.isArray(module.children)) {
                        found = this.findAdminModule(module.children, moduleId);
                        if (found) {
                            return found;
                        }
                    }
                }
            } else {
                if (module.id === moduleId) {
                    return module;
                }
            }
        }
        return null;
    }
}

module.exports = Component;
