/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { OrganisationAdditionalInformationKeys } from '../../core/context/OrganisationContext';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState> {

    private instanceId: string;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            context.registerListener('contact-list-widget', {
                sidebarRightToggled: (): void => { return; },
                scrollInformationChanged: () => { return; },
                objectListChanged: () => { return; },
                objectChanged: (): void => { return; },
                filteredObjectListChanged: (): void => { return; },
                sidebarLeftToggled: (): void => { return; },
                additionalInformationChanged: (key: string, value: any) => {
                    this.setWidgetDependingMode();
                }
            });

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.instanceId),
                eventPublished: (data: any, eventId: string): void => {
                    if (eventId === ContextUIEvent.RELOAD_OBJECTS && data === KIXObjectType.CONTACT) {
                        this.state.prepared = false;
                    } else if (eventId === ContextUIEvent.RELOAD_OBJECTS_FINISHED && data === KIXObjectType.CONTACT) {
                        this.state.prepared = true;
                    }
                }
            };
            EventService.getInstance().subscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
            EventService.getInstance().subscribe(ContextUIEvent.RELOAD_OBJECTS_FINISHED, this.subscriber);
        }

        this.state.filterActions = await ActionFactory.getInstance().generateActions(
            ['contact-table-depending-action']
        );

        this.setWidgetDependingMode();
        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.unregisterListener('contact-list-widget');
        }

        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS_FINISHED, this.subscriber);
    }

    private async setWidgetDependingMode(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const depending = context.getAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
            );

            if (typeof depending !== 'undefined' && depending) {
                WidgetService.getInstance().setWidgetTitle(this.instanceId, 'Translatable#Assigned Contacts');
                WidgetService.getInstance().setWidgetClasses(this.instanceId, ['depending-widget']);
            } else {
                WidgetService.getInstance().setWidgetTitle(this.instanceId, null);
                WidgetService.getInstance().setWidgetClasses(this.instanceId, []);
            }

            this.state.filterActions = await ActionFactory.getInstance().generateActions(
                ['contact-table-depending-action']
            );
            WidgetService.getInstance().updateActions(this.instanceId);
        }
    }

}

module.exports = Component;
