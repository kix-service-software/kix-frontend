/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { NewTicketDialogContext, TicketCreateAction } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { TicketDetailsContext } from './context';
import { DoNotSentEventHandler } from './DoNotSentEventHandler';

export class UIModule implements IUIModule {

    public name: string = 'TicketCreateUIModule';

    public priority: number = 102;

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        // FIXME: switch validator for new object form handling
        // FormValidationService.getInstance().registerValidator(new PendingTimeValidator());

        this.registerContexts();
        this.registerTicketActions();
    }

    private async registerContexts(): Promise<void> {
        const newTicketContext = new ContextDescriptor(
            NewTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.CREATE,
            false, 'object-form', ['tickets'], NewTicketDialogContext,
            [
                new UIComponentPermission('tickets', [CRUD.CREATE])
            ],
            'Translatable#Ticket', 'kix-icon-ticket', TicketDetailsContext.CONTEXT_ID, 100
        );
        ContextService.getInstance().registerContext(newTicketContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('ticket-create-action', TicketCreateAction);
    }

}
