/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../core/ContextService';
import { LabelService } from '../../core/LabelService';
import { EventService } from '../../core/EventService';
import { ContextEvents } from '../../core/ContextEvents';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { Context } from 'mocha';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await this.setTitle();
        this.setIcon();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
            eventPublished: async (data: Context, eventId: string): Promise<void> => {
                if (eventId === ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED) {
                    await this.setTitle();
                } else if (eventId === ContextEvents.CONTEXT_ICON_CHANGED) {
                    this.setIcon();
                }
            }
        };

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_ICON_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_ICON_CHANGED, this.subscriber);
    }

    private async setTitle(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        let objectText = '';
        const object = await context.getObject();
        if (object) {
            objectText = await LabelService.getInstance().getObjectText(object);
        }
        const displayText = await context.getDisplayText();
        this.state.title = objectText ? `${displayText} (${objectText})` : displayText;
    }

    private setIcon(): void {
        const context = ContextService.getInstance().getActiveContext();
        this.state.icon = context.getIcon();
    }

}

module.exports = Component;
