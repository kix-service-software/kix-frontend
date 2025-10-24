/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { ObjectInformationCardConfiguration } from './ObjectInformationCardConfiguration';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;
    private updateTimeout: any;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (this.state.instanceId !== input.instanceId) {
            this.state.instanceId = input.instanceId;

            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }

            this.updateTimeout = setTimeout(() => this.initWidget(), 50);
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.contextListenerId = IdService.generateDateBasedId('object-information-widget-');
        this.context?.registerListener(this.contextListenerId, {
            sidebarLeftToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (contactId: string, object: KIXObject, type: KIXObjectType) => {
                this.initWidget();
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.initWidget();
    }

    public onDestroy(): void {
        this.context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(): Promise<void> {
        this.state.config = null;

        this.state.object = await this.context.getObject();

        this.state.widgetConfiguration = this.context
            ? await this.context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        setTimeout(() => {
            this.state.config = this.state.widgetConfiguration?.configuration as ObjectInformationCardConfiguration;
        }, 50);
    }




}

module.exports = Component;
