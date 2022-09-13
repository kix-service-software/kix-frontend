/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

        this.state.isExternalUrl = this.state.url.toLowerCase().startsWith('http');

        this.state.loading = false;
    }

    public async linkClicked(event: any): Promise<void> {
        if (event.preventDefault) {
            event.preventDefault();
        }

        if (this.state.routingConfiguration) {
            const urlParams = this.state.routingConfiguration?.params;
            let urlSearchParams;
            if (Array.isArray(urlParams) && urlParams.length) {
                const encodedParams = [];
                for (const p of urlParams) {
                    const value = await BrowserUtil.prepareUrlParameterValue(p[1]);
                    encodedParams.push([p[0], value]);
                }
                urlSearchParams = new URLSearchParams(encodedParams);
            }

            ContextService.getInstance().setActiveContext(
                this.state.routingConfiguration.contextId, this.state.objectId, urlSearchParams,
                this.state.routingConfiguration.additionalInformation
            );
        }
    }

}

module.exports = Component;
