import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { ConfiguredWidget } from '../../../core/model';
import { KIXModulesService } from '../../../core/browser/modules';
import { FAQContext } from '../../../core/browser/faq/context/FAQContext';

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
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

}

module.exports = Component;
