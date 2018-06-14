import { HomeComponentState } from './HomeComponentState';
import { BreadcrumbDetails, Context, ConfiguredWidget, ObjectIcon, ContextType } from '@kix/core/dist/model/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { ContextService } from '@kix/core/dist/browser/context/';
import { HomeContext, HomeContextConfiguration } from '@kix/core/dist/browser/home';
import { ComponentsService } from '@kix/core/dist/browser/components';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public onMount(): void {
        const context = (ContextService.getInstance().getContext(HomeContext.CONTEXT_ID) as HomeContext);
        this.state.contentWidgets = context.getContent();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = HomeComponent;
