/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    TicketTypeFormService, TicketPriorityFormService, TicketStateFormService, QueueFormService,
    TicketPriorityTableFactory, TicketQueueTableFactory, TicketTypeTableFactory, TicketStateTableFactory,
    TicketTypeCreateAction, NewTicketTypeDialogContext, TicketTypeEditAction,
    EditTicketTypeDialogContext, TicketTypeTableDeleteAction, TicketStateCreateAction,
    NewTicketStateDialogContext, TicketStateEditAction, EditTicketStateDialogContext, TicketStateTableDeleteAction,
    TicketPriorityCreateAction, NewTicketPriorityDialogContext, TicketPriorityEditAction,
    EditTicketPriorityDialogContext, TicketPriorityTableDeleteAction,
    TicketQueueCreateAction, NewQueueDialogContext, TicketQueueEditAction, EditQueueDialogContext
} from '.';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { QueueDuplicateAction } from './admin';
import { UIModule as TicketReadUIModule } from './TicketReadUIModule';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';

export class UIModule extends TicketReadUIModule {

    public priority: number = 104;

    public name: string = 'TicketAdminUIModule';

    protected doRegisterContexts: boolean = false;

    public async register(): Promise<void> {
        super.register();
        ServiceRegistry.registerServiceInstance(TicketTypeFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateFormService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new TicketPriorityTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketQueueTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketTypeTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketStateTableFactory());

        await this.registerTicketTypeAdmin();
        await this.registerTicketStatesAdmin();
        await this.registerTicketPrioritiesAdmin();
        await this.registerTicketQueuesAdmin();
    }

    private async registerTicketTypeAdmin(): Promise<void> {

        ActionFactory.getInstance().registerAction('ticket-admin-type-create', TicketTypeCreateAction);

        const newTicketTypeContext = new ContextDescriptor(
            NewTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['tickettypes'], NewTicketTypeDialogContext,
            [
                new UIComponentPermission('system/ticket/types', [CRUD.CREATE])
            ],
            'Translatable#New Type', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newTicketTypeContext);

        ActionFactory.getInstance().registerAction('ticket-admin-type-edit', TicketTypeEditAction);
        const editTicketTypeContext = new ContextDescriptor(
            EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['tickettypes'], EditTicketTypeDialogContext,
            [
                new UIComponentPermission('system/ticket/types', [CRUD.CREATE])
            ],
            'Translatable#Edit Type', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editTicketTypeContext);

        ActionFactory.getInstance().registerAction('ticket-admin-type-table-delete', TicketTypeTableDeleteAction);
    }

    private async registerTicketStatesAdmin(): Promise<void> {

        ActionFactory.getInstance().registerAction('ticket-admin-state-create', TicketStateCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-delete', TicketStateTableDeleteAction);

        const newTicketStateContext = new ContextDescriptor(
            NewTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['ticketstates'], NewTicketStateDialogContext,
            [
                new UIComponentPermission('system/ticket/states', [CRUD.CREATE])
            ],
            'Translatable#New State', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newTicketStateContext);

        ActionFactory.getInstance().registerAction('ticket-admin-state-edit', TicketStateEditAction);

        const editTicketStateContext = new ContextDescriptor(
            EditTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['ticketstates'], EditTicketStateDialogContext,
            [
                new UIComponentPermission('system/ticket/states', [CRUD.CREATE])
            ],
            'Translatable#Edit State', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editTicketStateContext);

        ActionFactory.getInstance().registerAction('ticket-admin-state-table-delete', TicketStateTableDeleteAction);
    }

    private async registerTicketPrioritiesAdmin(): Promise<void> {

        ActionFactory.getInstance().registerAction('ticket-admin-priority-create', TicketPriorityCreateAction);

        const newTicketPriorityContext = new ContextDescriptor(
            NewTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['priorities'], NewTicketPriorityDialogContext,
            [
                new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE])
            ],
            'Translatable#New Priority', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newTicketPriorityContext);

        ActionFactory.getInstance().registerAction('ticket-admin-priority-edit', TicketPriorityEditAction);

        const editTicketPriorityContext = new ContextDescriptor(
            EditTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['priorities'], EditTicketPriorityDialogContext,
            [
                new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE])
            ],
            'Translatable#Edit Priority', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editTicketPriorityContext);

        ActionFactory.getInstance().registerAction('ticket-admin-priority-table-delete',
            TicketPriorityTableDeleteAction
        );
    }

    private async registerTicketQueuesAdmin(): Promise<void> {

        ActionFactory.getInstance().registerAction('ticket-admin-queue-create', TicketQueueCreateAction);

        const newQueueContext = new ContextDescriptor(
            NewQueueDialogContext.CONTEXT_ID, [KIXObjectType.QUEUE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['queues'], NewQueueDialogContext,
            [
                new UIComponentPermission('system/ticket/queues', [CRUD.CREATE])
            ],
            'Translatable#New Team', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newQueueContext);

        ActionFactory.getInstance().registerAction('ticket-admin-queue-edit', TicketQueueEditAction);

        const editQueueContext = new ContextDescriptor(
            EditQueueDialogContext.CONTEXT_ID, [KIXObjectType.QUEUE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['queues'], EditQueueDialogContext,
            [
                new UIComponentPermission('system/ticket/queues', [CRUD.CREATE])
            ],
            'Translatable#Edit Team', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editQueueContext);

        ActionFactory.getInstance().registerAction('ticket-admin-queue-duplicate', QueueDuplicateAction);
    }
}
