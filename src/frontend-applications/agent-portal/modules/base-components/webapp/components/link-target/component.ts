/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { BrowserUtil } from '../../core/BrowserUtil';
import { RoutingService } from '../../core/RoutingService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.routingConfiguration = input.routingConfiguration ? { ...input.routingConfiguration } : null;
        this.state.objectId = input.objectId || this.state.routingConfiguration?.replaceObjectId;
        this.state.object = input.object;
        this.setURL();
    }

    private async setURL(): Promise<void> {
        this.state.loading = true;
        if (this.state.routingConfiguration) {
            this.setContextIdIfNecessary();
            this.state.url = await ContextService.getInstance().getURI(
                this.state.routingConfiguration.contextId, this.state.objectId,
                this.state.routingConfiguration.params
            );
        } else if (this.state.object) {
            const url = await KIXObjectService.getObjectUrl(this.state.object);
            if (url) {
                this.state.url = '/' + url;
            }
        }

        this.state.isExternalUrl = this.state.url?.toLowerCase().startsWith('http');

        this.state.loading = false;
    }

    private setContextIdIfNecessary(): void {
        if (!this.state.routingConfiguration.contextId &&
            this.state.routingConfiguration.contextMode &&
            this.state.routingConfiguration.objectType
        ) {
            const descriptors = ContextService.getInstance().getContextDescriptors(
                this.state.routingConfiguration.contextMode,
                this.state.routingConfiguration.objectType
            );
            // use id of first found
            if (descriptors?.length) {
                this.state.routingConfiguration.contextId = descriptors[0].contextId;
            }
        }
    }

    public async linkClicked(event: any): Promise<void> {
        if (event.preventDefault) {
            event.preventDefault();
        }

        if (this.state.routingConfiguration?.contextId) {
            RoutingService.getInstance().routeTo(this.state.routingConfiguration, this.state.objectId);
        }
    }

}

module.exports = Component;
