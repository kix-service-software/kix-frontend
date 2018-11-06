import { ComponentState } from './ComponentState';
import { RoutingService } from '@kix/core/dist/browser/router';
import { ContextService, KIXObjectService } from '@kix/core/dist/browser';
import { ContextType } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.routingConfiguration = input.routingConfiguration ? { ...input.routingConfiguration } : null;
        this.state.objectId = input.objectId;
        this.state.object = input.object;
        this.setURL();
    }

    private async setURL(): Promise<void> {
        this.state.loading = true;
        if (this.state.routingConfiguration) {
            const contextUrl = await RoutingService.getInstance().buildUrl(
                this.state.routingConfiguration, this.state.objectId
            );
            this.state.routingConfiguration.path = contextUrl;
            this.state.url = '/' + contextUrl;
        } else if (this.state.object) {
            const url = await KIXObjectService.getObjectUrl(this.state.object);
            if (url) {
                this.state.url = '/' + url;
            }
        }
        this.state.loading = false;
    }

    public linkClicked(event: any): void {
        let externalLink = this.state.routingConfiguration ? this.state.routingConfiguration.externalLink : undefined;
        if (typeof externalLink === 'undefined') {
            const context = ContextService.getInstance().getActiveContext();
            externalLink = context ? context.getDescriptor().contextType === ContextType.DIALOG : false;
        }
        if (!externalLink) {
            if (event.preventDefault) {
                event.preventDefault(event);
            }
            RoutingService.getInstance().routeToContext(this.state.routingConfiguration, this.state.objectId);
        }
    }

}

module.exports = Component;
