import { ComponentState } from './ComponentState';
import { RoutingService, RoutingConfiguration, DialogRoutingConfiguration } from '../../../core/browser/router';
import { ContextService, KIXObjectService, LabelService } from '../../../core/browser';
import { ContextType } from '../../../core/model';

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
        if (this.state.routingConfiguration && this.state.routingConfiguration instanceof RoutingConfiguration) {
            const contextUrl = await RoutingService.getInstance().buildUrl(
                this.state.routingConfiguration, this.state.objectId
            );
            this.state.url = '/' + contextUrl;
        } else if (this.state.object) {
            const url = await KIXObjectService.getObjectUrl(this.state.object);
            if (url) {
                this.state.url = '/' + url;
            }
        }
        this.state.loading = false;
    }

    public async linkClicked(event: any): Promise<void> {
        if (
            this.state.routingConfiguration.contextType &&
            this.state.routingConfiguration.contextType === ContextType.DIALOG
        ) {
            this.openDialog();
        } else {
            this.routeTo();
        }
    }

    private async openDialog(): Promise<void> {
        this.state.routingConfiguration = this.state.routingConfiguration as DialogRoutingConfiguration;

        const objectId = this.state.routingConfiguration.objectId
            ? this.state.routingConfiguration.objectId : this.state.objectId;

        // TODO: it is not the right place to prepare the title like this, but have to (currently)
        if (
            !this.state.routingConfiguration.title
            && this.state.routingConfiguration.objectType
            && objectId
        ) {
            const objects = objectId ? await KIXObjectService.loadObjects(
                this.state.routingConfiguration.objectType, [objectId]
            ) : null;
            if (objects && !!objects.length) {
                this.state.routingConfiguration.title = await LabelService.getInstance().getText(objects[0]);
            }
        }

        ContextService.getInstance().setDialogContext(
            this.state.routingConfiguration.contextId,
            this.state.routingConfiguration.objectType, this.state.routingConfiguration.contextMode,
            objectId, this.state.routingConfiguration.resetContext,
            this.state.routingConfiguration.title, this.state.routingConfiguration.singleTab,
            this.state.routingConfiguration.formId, this.state.routingConfiguration.icon,
            this.state.routingConfiguration.resetForm
        );
    }

    private routeTo(): void {
        this.state.routingConfiguration = this.state.routingConfiguration as RoutingConfiguration;
        let externalLink = this.state.routingConfiguration
            ? this.state.routingConfiguration.externalLink : undefined;
        if (typeof externalLink === 'undefined') {
            const context = ContextService.getInstance().getActiveContext();
            externalLink = context ? context.getDescriptor().contextType === ContextType.DIALOG : false;
        }
        if (!externalLink) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            RoutingService.getInstance().routeToContext(this.state.routingConfiguration, this.state.objectId);
        }
    }

}

module.exports = Component;
