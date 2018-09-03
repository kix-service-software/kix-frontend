import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser';
import { CMDBContext } from '@kix/core/dist/browser/cmdb';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(CMDBContext.CONTEXT_ID) as CMDBContext);
        this.state.contentWidgets = context.getContent();
    }

}

module.exports = Component;
