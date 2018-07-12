import { ComponentState } from './ComponentState';
import { RoutingService } from '@kix/core/dist/browser/router';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.contextId = input.contextId;
        this.state.objectType = input.objectType;
        this.state.objectId = input.objectId;
        this.state.contextMode = input.contextMode;

        this.setURL();
    }

    private async setURL(): Promise<void> {
        this.state.loading = true;

        this.state.url = await RoutingService.getInstance().buildUrl(
            this.state.contextId, this.state.objectType, this.state.contextMode, this.state.objectId
        );

        this.state.loading = false;
    }

    public linkClicked(): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        RoutingService.getInstance().routeToContext(
            this.state.contextId, this.state.objectType, this.state.contextMode, this.state.objectId
        );
    }

}

module.exports = Component;
