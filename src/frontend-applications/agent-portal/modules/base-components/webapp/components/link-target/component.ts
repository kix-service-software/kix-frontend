/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import { ContextType } from '../../../../../model/ContextType';
import { DialogRoutingConfiguration } from '../../../../../model/configuration/DialogRoutingConfiguration';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';

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
            this.state.url = contextUrl ? '/' + contextUrl
                : this.state.routingConfiguration.contextType
                    && this.state.routingConfiguration.contextType === ContextType.DIALOG
                    ? '/#' : undefined;
        } else if (this.state.object) {
            const url = await KIXObjectService.getObjectUrl(this.state.object);
            if (url) {
                this.state.url = '/' + url;
            }
        }
        this.state.loading = false;
    }

    public async linkClicked(event: any): Promise<void> {
        const contextType = this.state.routingConfiguration.contextType;
        if (contextType && contextType === ContextType.DIALOG) {
            this.openDialog(event);
        } else {
            this.routeTo(event);
        }
    }

    private async openDialog(event: any): Promise<void> {
        if (event.preventDefault) {
            event.preventDefault();
        }
        const configuration = this.state.routingConfiguration as DialogRoutingConfiguration;

        const objectId = configuration.objectId ? configuration.objectId : this.state.objectId;

        // TODO: it is not the right place to prepare the title like this, but have to (currently)
        if (!configuration.title && configuration.objectType && objectId) {
            const objects = await KIXObjectService.loadObjects(configuration.objectType, [objectId]);

            if (objects && !!objects.length) {
                configuration.title = await LabelService.getInstance().getObjectText(objects[0]);
            }
        }

        ContextService.getInstance().setDialogContext(
            configuration.contextId,
            configuration.objectType,
            configuration.contextMode,
            objectId,
            configuration.resetContext,
            configuration.title,
            configuration.singleTab,
            configuration.icon,
        );
    }

    private routeTo(event: any): void {
        let externalLink = this.state.routingConfiguration
            ? this.state.routingConfiguration.externalLink
            : undefined;

        if (typeof externalLink === 'undefined') {
            const context = ContextService.getInstance().getActiveContext();
            externalLink = context ? context.getDescriptor().contextType === ContextType.DIALOG : false;
        }

        if (!externalLink) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            RoutingService.getInstance().routeToContext(
                this.state.routingConfiguration, this.state.objectId,
                undefined, this.state.routingConfiguration.resetContext
            );
        }
    }

}

module.exports = Component;
