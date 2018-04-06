import { HomeComponentState } from './HomeComponentState';
import { BreadcrumbDetails, Context, ConfiguredWidget } from '@kix/core/dist/model/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { ContextNotification, ContextService } from '@kix/core/dist/browser/context/';
import { HomeContext, HomeContextConfiguration } from '@kix/core/dist/browser/home';
import { ComponentsService } from '@kix/core/dist/browser/components';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        ContextService.getInstance().provideContext(new HomeContext(), true);
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args: any[]): void {
        if (type === ContextNotification.CONTEXT_CHANGED && id === HomeContext.CONTEXT_ID) {
            const context = ContextService.getInstance().getContext<HomeContextConfiguration, HomeContext>();
            if (context) {
                this.state.contentWidgets = context.getContent();
            }
        }
    }

    private getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = HomeComponent;
