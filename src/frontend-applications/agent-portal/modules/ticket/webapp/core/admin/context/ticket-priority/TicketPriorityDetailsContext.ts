/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../../../model/Context";
import { LabelService } from "../../../../../../../modules/base-components/webapp/core/LabelService";
import { TicketPriority } from "../../../../../model/TicketPriority";
import { BreadcrumbInformation } from "../../../../../../../model/BreadcrumbInformation";
import { TranslationService } from "../../../../../../../modules/translation/webapp/core/TranslationService";
import { AdminContext } from "../../../../../../admin/webapp/core";
import { KIXObject } from "../../../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { EventService } from "../../../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";

export class TicketPriorityDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-priority-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TicketPriority>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Priority');
        const state = await this.getObject<TicketPriority>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${state.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY,
        reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTicketPriority(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.TICKET_PRIORITY, changedProperties)
            );
        }

        return object;
    }

    private async loadTicketPriority(changedProperties: string[] = [], cache: boolean = true): Promise<TicketPriority> {
        const ticketPriorityId = Number(this.objectId);

        const ticketPriorities = await KIXObjectService.loadObjects<TicketPriority>(
            KIXObjectType.TICKET_PRIORITY, [ticketPriorityId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let ticketPriority: TicketPriority;
        if (ticketPriorities && ticketPriorities.length) {
            ticketPriority = ticketPriorities[0];
            this.objectId = ticketPriority.ID;
        }

        return ticketPriority;
    }

}
