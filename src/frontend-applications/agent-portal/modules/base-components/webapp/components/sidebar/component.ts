import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { ContextEvents } from '../../core/ContextEvents';
import { ContextService } from '../../core/ContextService';
import { EventService } from '../../core/EventService';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { KIXModulesService } from '../../core/KIXModulesService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public subscriber: IEventSubscriber;
    private isLeft: boolean;
    private hasSidebars: boolean;

    public onInput(input: any): void {
        this.isLeft = input.isLeft;
    }

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('Sidebar'),
            eventPublished: async (context: Context, eventId: string): Promise<void> => {
                if (eventId === ContextEvents.CONTEXT_REMOVED) {
                    const index = this.state.contextList.findIndex((c) => c.instanceId === context?.instanceId);
                    if (index !== -1) {
                        this.state.contextList.splice(index, 1);
                    }
                } else if (eventId === ContextEvents.CONTEXT_CHANGED) {
                    if (!this.state.contextList.some((c) => c.instanceId === context.instanceId)) {
                        this.state.contextList.push(context);
                    }
                }

                const activeContext = ContextService.getInstance().getActiveContext();

                const sidebars = this.isLeft
                    ? await activeContext?.getSidebarsLeft() || []
                    : await activeContext?.getSidebarsRight() || [];

                this.hasSidebars = sidebars?.length > 0;

                (this as any).setStateDirty('contextList');
            }
        };
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
    }

    public isActiveContext(instanceId: string): boolean {
        const activeContext = ContextService.getInstance().getActiveContext();
        return activeContext?.instanceId === instanceId && this.hasSidebars;
    }

    public getSidebarTemplate(): any {
        return KIXModulesService.getComponentTemplate('context-sidebar');
    }
}

module.exports = Component;