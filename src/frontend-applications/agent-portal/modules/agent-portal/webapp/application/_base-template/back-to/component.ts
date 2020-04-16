/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ContextHistoryEntry } from '../../../../../../modules/base-components/webapp/core/ContextHistoryEntry';
import { ContextDescriptor } from '../../../../../../model/ContextDescriptor';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { ContextUIEvent } from '../../../../../base-components/webapp/core/ContextUIEvent';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../../model/IdService';

class Component {

    public state: ComponentState;

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        document.addEventListener('click', (event: any) => {
            if (!this.state.minimized) {
                if (this.state.keepShow) {
                    this.state.keepShow = false;
                } else {
                    this.toggleList();
                }
            }
        }, false);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('back-to'),
            eventPublished: (data: any, eventId: string) => {
                if (eventId === ContextUIEvent.HISTORY_CHANGED) {
                    this.state.history = ContextService.getInstance().getHistory();
                }
            }
        };

        EventService.getInstance().subscribe(ContextUIEvent.HISTORY_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextUIEvent.HISTORY_CHANGED, this.subscriber);
    }

    public listClicked(): void {
        this.state.keepShow = true;
    }

    private toggleList(): void {
        this.state.keepShow = true;
        this.state.minimized = !this.state.minimized;
    }

    public navigate(entry: ContextHistoryEntry): void {
        this.toggleList();
    }

    public contextRegistered(descriptor: ContextDescriptor): void {
        return;
    }

    public getRoutingConfiguration(entry: ContextHistoryEntry): RoutingConfiguration {
        return new RoutingConfiguration(entry.contextId, null, entry.descriptor.contextMode, null, true);
    }

}

module.exports = Component;
