/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { TicketFormService, TicketBulkManager, EditTicketDialogContext, TicketEditAction } from '.';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { BulkService } from '../../../bulk/webapp/core';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { TicketDetailsContext } from './context';
import { ObjectFormRegistry } from '../../../object-forms/webapp/core/ObjectFormRegistry';
import { TicketObjectCommitHandler } from './form/TicketObjectCommitHandler';

export class UIModule implements IUIModule {

    public priority: number = 102;

    public name: string = 'TicketUpdateUIModule';

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());

        // FIXME: switch validator for new object form handling
        // FormValidationService.getInstance().registerValidator(new PendingTimeValidator());

        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        ObjectFormRegistry.getInstance().registerObjectCommitHandler(KIXObjectType.TICKET, TicketObjectCommitHandler);

        this.registerContexts();
        this.registerTicketActions();
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

    private registerContexts(): void {
        const editTicketContext = new ContextDescriptor(
            EditTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.EDIT,
            false, 'object-form', ['tickets'], EditTicketDialogContext,
            [
                new UIComponentPermission('tickets', [CRUD.CREATE])
            ],
            'Translatable#Edit Ticket', 'kix-icon-ticket', TicketDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editTicketContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('ticket-edit-action', TicketEditAction);
    }
}
