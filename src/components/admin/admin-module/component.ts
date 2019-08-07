/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent, ContextService } from '../../../core/browser';
import { ComponentState } from './ComponentState';
import { AdminContext } from '../../../core/browser/admin';
import { KIXObject, KIXObjectType, AdminModule, ContextType } from '../../../core/model';
import { KIXModulesService } from '../../../core/browser/modules';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'admin-module-context-service-listener',
            contextChanged: (contextId: string, c: AdminContext, type: ContextType, history: boolean) => {
                if (contextId === AdminContext.CONTEXT_ID && c.adminModule) {
                    this.state.template = KIXModulesService.getComponentTemplate(
                        c.adminModule.componentId
                    );
                    (this as any).setStateDirty('template');
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
            scrollInformationChanged: () => { return; }
        });
    }

    public onDestroy(): void {
        ContextService.getInstance().unregisterListener('admin-module-context-service-listener');
    }

    public moduleChanged(
        objectId: string | number, object: KIXObject | any, type: KIXObjectType, changedProperties?: string[]
    ): void {
        if (object instanceof AdminModule) {
            this.state.template = KIXModulesService.getComponentTemplate(object.componentId);
        }
    }

}

module.exports = Component;
