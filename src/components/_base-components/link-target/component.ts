import { ComponentState } from './ComponentState';
import { RoutingService } from '@kix/core/dist/browser/router';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.routingConfiguration = input.routingConfiguration;
        this.state.objectId = input.objectId;
        this.setURL();
    }

    private async setURL(): Promise<void> {
        this.state.loading = true;
        if (this.state.routingConfiguration) {
            const contextUrl = await RoutingService.getInstance().buildUrl(
                this.state.routingConfiguration, this.state.objectId
            );
            this.state.url = '/' + contextUrl;
        }
        this.state.loading = false;
    }

    public linkClicked(): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        RoutingService.getInstance().routeToContext(this.state.routingConfiguration, this.state.objectId);
    }

}

module.exports = Component;
