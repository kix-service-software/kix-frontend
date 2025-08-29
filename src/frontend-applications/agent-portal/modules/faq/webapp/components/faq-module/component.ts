/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { IdService } from '../../../../../model/IdService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {
    private subscriber: IEventSubscriber;


    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (): void => {
                this.prepareWidgets();
            }
        };
        this.prepareWidgets();

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_USER_WIDGETS_CHANGED, this.subscriber);
    }

    private async prepareWidgets(): Promise<void> {
        this.state.prepared = false;
        setTimeout(async () => {
            this.state.contentWidgets = await this.context.getContent();
            this.state.prepared = true;
        }, 100);
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

}

module.exports = Component;
