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
        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: HomeContext) => {
                if (contextId === HomeContext.CONTEXT_ID) {
                    this.state.contentWidgets = context.getContent();
                }
            },
            objectListUpdated: () => { return; },
            objectUpdated: () => { return; }
        });
        ContextService.getInstance().provideContext(new HomeContext(), true, ContextType.MAIN);
    }

    private getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = HomeComponent;
