/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ServiceRegistry, ContextService, ActionFactory } from '../../../../core/browser';
import {
    TicketFormService, PendingTimeValidator, EmailRecipientValidator, TicketBulkManager,
    EditTicketDialogContext, TicketEditAction
} from '../../../../core/browser/ticket';
import { BulkService } from '../../../../core/browser/bulk';
import { ContextDescriptor, KIXObjectType, ContextType, ContextMode, CRUD } from '../../../../core/model';
import { FormValidationService } from '../../../../core/browser/form/validation';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 101;

    public name: string = 'TicketUpdateUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        TicketFormService.getInstance();

        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        await this.registerContexts();
        this.registerTicketActions();
    }

    private async registerContexts(): Promise<void> {
        const editTicketContext = new ContextDescriptor(
            EditTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-ticket-dialog', ['tickets'], EditTicketDialogContext
        );
        await ContextService.getInstance().registerContext(editTicketContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('ticket-edit-action', TicketEditAction);
    }
}
