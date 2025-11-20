/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { CalendarConfiguration } from '../../core/CalendarConfiguration';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';

declare const tui: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;
    private widgetConfiguration: WidgetConfiguration;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        if (this.context) {
            this.widgetConfiguration = await this.context.getWidgetConfiguration(this.state.instanceId);
            this.state.calendarConfig = this.widgetConfiguration?.configuration as CalendarConfiguration;
            if (this.widgetConfiguration?.contextDependent) {
                this.contextListenerId = 'calendar widget' + this.widgetConfiguration.instanceId;
                this.context?.registerListener(this.contextListenerId, {
                    additionalInformationChanged: () => null,
                    sidebarLeftToggled: () => null,
                    filteredObjectListChanged: async () => {
                        if (this.widgetConfiguration.contextDependent) {
                            this.state.tickets = this.context?.getFilteredObjectList(KIXObjectType.TICKET);
                        }
                    },
                    objectChanged: () => null,
                    objectListChanged: () => null,
                    scrollInformationChanged: () => null,
                    sidebarRightToggled: () => null
                });

                this.state.tickets = this.context?.getFilteredObjectList(KIXObjectType.TICKET);
            }
        }
        this.state.prepared = true;
    }

    public onDestroy(): void {
        this.context?.unregisterListener(this.contextListenerId);
    }
}

module.exports = Component;
