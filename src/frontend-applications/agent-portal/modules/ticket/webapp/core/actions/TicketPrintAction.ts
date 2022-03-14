/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

export class TicketPrintAction extends AbstractAction {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = 'kix-icon-print';
    }

    public async run(event: any): Promise<void> {

        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const ticketId = context.getObjectId();
            const printFrame: any = document.createElement('iframe');
            printFrame.src = `/tickets/${ticketId}/print`;
            document.body.appendChild(printFrame);

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Prepare Ticket for print' }
            );

            printFrame.onload = (): void => {
                setTimeout(() => {
                    window.frames[window.frames.length - 1].focus();
                    window.frames[window.frames.length - 1].print();
                    document.body.removeChild(printFrame);
                    EventService.getInstance().publish(
                        ApplicationEvent.APP_LOADING, { loading: false }
                    );
                }, 5000);
            };
        }
    }

}
