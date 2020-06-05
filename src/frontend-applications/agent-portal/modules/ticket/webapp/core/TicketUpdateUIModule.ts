/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    TicketFormService, TicketBulkManager, PendingTimeValidator, EmailRecipientValidator,
    EditTicketDialogContext, TicketEditAction
} from '.';
import { FormValidationService } from '../../../../modules/base-components/webapp/core/FormValidationService';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { BulkService } from '../../../bulk/webapp/core';

export class UIModule implements IUIModule {

    public priority: number = 101;

    public name: string = 'TicketUpdateUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        if (await this.checkPermissions('tickets/*', [CRUD.UPDATE])) {
            BulkService.getInstance().registerBulkManager(new TicketBulkManager());
        }

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

    private async checkPermissions(resource: string, crud: CRUD[]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }
}
