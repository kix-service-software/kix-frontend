import { HomeComponentState } from './HomeComponentState';
import { ContextService } from '../../../core/browser/context/';
import { HomeContext } from '../../../core/browser/home';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(HomeContext.CONTEXT_ID) as HomeContext);
        this.state.contentWidgets = context.getContent();
    }

}

module.exports = HomeComponent;
