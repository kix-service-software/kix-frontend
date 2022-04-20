/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { EventService } from '../../core/EventService';
import { RoutingEvent } from '../../core/RoutingEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../core/ContextService';

export class RouterOutletComponent {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public onMount(): void {

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.state.componentId = context.descriptor?.componentId;
            this.state.data = { objectId: context.getObjectId() };
            this.state.template = KIXModulesService.getComponentTemplate(this.state.componentId);
        }

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('RouterOutlet'),
            eventPublished: this.routedTo.bind(this)
        };
        EventService.getInstance().subscribe(RoutingEvent.ROUTE_TO, this.subscriber);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(RoutingEvent.ROUTE_TO, this.subscriber);
    }

    public routedTo(data: any): void {
        if (data.componentId) {
            this.state.prepared = false;

            this.state.componentId = data.componentId;
            this.state.data = data.data;

            this.state.template = KIXModulesService.getComponentTemplate(this.state.componentId);
            setTimeout(() => this.state.prepared = true, 50);
        }
    }


}

module.exports = RouterOutletComponent;
