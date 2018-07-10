import { HomeComponentState } from './HomeComponentState';
import { ConfiguredWidget } from '@kix/core/dist/model/';
import { ContextService } from '@kix/core/dist/browser/context/';
import { HomeContext } from '@kix/core/dist/browser/home';
import { ComponentsService } from '@kix/core/dist/browser/components';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(HomeContext.CONTEXT_ID) as HomeContext);
        this.state.contentWidgets = context.getContent();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = HomeComponent;
