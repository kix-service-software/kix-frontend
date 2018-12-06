import { AbstractMarkoComponent, ContextService } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { AdminContext } from '@kix/core/dist/browser/admin';
import { KIXObject, KIXObjectType, AdminModule, ContextType } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, c: AdminContext, type: ContextType, history: boolean) => {
                if (contextId === AdminContext.CONTEXT_ID && c.adminModule) {
                    this.state.template = ComponentsService.getInstance().getComponentTemplate(
                        c.adminModule.componentId
                    );
                    (this as any).setStateDirty('template');
                }
            }
        });
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        context.registerListener('admin-module-context-listener', {
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: this.moduleChanged.bind(this),
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });
    }

    public moduleChanged(
        objectId: string | number, object: KIXObject | any, type: KIXObjectType, changedProperties?: string[]
    ): void {
        if (object instanceof AdminModule) {
            this.state.template = ComponentsService.getInstance().getComponentTemplate(object.componentId);
        }
    }

}

module.exports = Component;
