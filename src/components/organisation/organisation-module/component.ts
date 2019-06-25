import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { ConfiguredWidget } from '../../../core/model';
import { OrganisationContext } from '../../../core/browser/organisation';
import { KIXModulesService } from '../../../core/browser/modules';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );
        this.state.contentWidgets = context.getContent();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = Component;
