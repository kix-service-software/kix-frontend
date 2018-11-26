import { AbstractMarkoComponent, ContextService } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { AdminContext } from '@kix/core/dist/browser/admin';
import { ContextDescriptor, KIXObjectType, ContextMode, ContextType } from '@kix/core/dist/model';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const contextDescriptor = new ContextDescriptor(
            AdminContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'admin', ['admin'], AdminContext
        );
        ContextService.getInstance().registerContext(contextDescriptor);
    }

    private registerDialogs(): void {
        return;
    }

    private registerActions(): void {
        return;
    }

}

module.exports = Component;
