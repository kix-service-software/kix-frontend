import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser';
import { FAQContext } from '@kix/core/dist/browser/faq';
import { ConfiguredWidget } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(FAQContext.CONTEXT_ID) as FAQContext);
        this.state.contentWidgets = context.getContent();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }

}

module.exports = Component;
