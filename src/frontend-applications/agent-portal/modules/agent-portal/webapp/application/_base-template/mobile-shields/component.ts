/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { Context } from '../../../../../../model/Context';
import { ContextType } from '../../../../../../model/ContextType';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { MobileShowEvent } from '../../../../model/MobileShowEvent';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { MobileShowEventData } from '../../../../model/MobileShowEventData';

class Component {

    public state: ComponentState;
    public eventSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'mobile-shields',
            contextChanged: (contextId: string, context: Context, type: ContextType): void => {
                this.closeMobile();
            },
            contextRegistered: () => { return; }
        });

        this.eventSubscriber = {
            eventSubscriberId: 'mobile-shields',
            eventPublished: (data, eventId: MobileShowEvent | string): void => {
                this.state.activeMobile =
                    (data === MobileShowEventData.SHOW_TOOLBAR || data === MobileShowEventData.SHOW_RIGHT_SIDEBAR) ?
                        2 : data ? 1 : null;
            }
        };
        EventService.getInstance().subscribe(MobileShowEvent.SHOW_MOBILE, this.eventSubscriber);
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
        EventService.getInstance().unsubscribe(MobileShowEvent.SHOW_MOBILE, this.eventSubscriber);
    }

    private resizeHandling(): void {
        this.closeMobile();
    }

    public closeMobile(): void {
        EventService.getInstance().publish(MobileShowEvent.SHOW_MOBILE, null);
        this.state.activeMobile = null;
    }
}

module.exports = Component;
