/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, BreadcrumbInformation, KIXObject, KIXObjectType, TicketState
} from "../../../../../model";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { LabelService } from "../../../../LabelService";
import { ApplicationEvent } from "../../../../application";
import { TranslationService } from "../../../../i18n/TranslationService";

export class TicketStateDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-state-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TicketState>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#State');
        const state = await this.getObject<TicketState>();
        return new BreadcrumbInformation(
            this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${state ? state.Name : ''}`
        );
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET_STATE, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTicketState(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.TICKET_STATE, changedProperties)
            );
        }

        return object;
    }

    private async loadTicketState(changedProperties: string[] = [], cache: boolean = true): Promise<TicketState> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Ticket State' }
        );

        const ticketStateId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Ticket State ...`
            });
        }, 500);

        const ticketStates = await KIXObjectService.loadObjects<TicketState>(
            KIXObjectType.TICKET_STATE, [ticketStateId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearInterval(timeout);

        let ticketState: TicketState;
        if (ticketStates && ticketStates.length) {
            ticketState = ticketStates[0];
            this.objectId = ticketState.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return ticketState;
    }

}
