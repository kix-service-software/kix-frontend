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
import { RoutingService } from '../../core/RoutingService';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';

class Component {

    private state: ComponentState;
    private routingConfiguration: RoutingConfiguration;
    private objectId: number;
    private object: KIXObject;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.routingConfiguration = input.routingConfiguration ? { ...input.routingConfiguration } : null;
        this.objectId = input.objectId || this.routingConfiguration?.replaceObjectId;
        this.object = input.object;
        this.setURL();
    }

    private async setURL(): Promise<void> {
        this.state.loading = true;

        if (this.routingConfiguration?.url) {
            this.state.url = this.routingConfiguration.url;
            this.state.isExternalUrl = true;
        } else if (this.routingConfiguration) {
            this.setContextIdIfNecessary();
            this.state.url = await ContextService.getInstance().getURI(
                this.routingConfiguration.contextId, this.objectId,
                this.routingConfiguration.params
            );
        } else if (this.object) {
            const url = await KIXObjectService.getObjectUrl(this.object);
            if (url) {
                this.state.url = '/' + url;
            }
        }

        if (!this.routingConfiguration.url) {
            this.state.isExternalUrl = this.state.url?.toLowerCase().startsWith('http');
        }

        this.state.loading = false;
    }

    private setContextIdIfNecessary(): void {
        if (!this.routingConfiguration.contextId &&
            this.routingConfiguration.contextMode &&
            this.routingConfiguration.objectType
        ) {
            const descriptors = ContextService.getInstance().getContextDescriptors(
                this.routingConfiguration.contextMode,
                this.routingConfiguration.objectType
            );
            // use id of first found
            if (descriptors?.length) {
                this.routingConfiguration.contextId = descriptors[0].contextId;
            }
        }
    }

    public async linkClicked(event: any): Promise<void> {
        if (event.preventDefault) {
            event.preventDefault();
        }

        if (this.routingConfiguration?.contextId) {
            RoutingService.getInstance().routeTo(this.routingConfiguration, this.objectId);
        }
    }

}

module.exports = Component;
