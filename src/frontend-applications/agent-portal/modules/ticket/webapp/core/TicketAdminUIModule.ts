/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    TicketTypeFormService, TicketPriorityFormService, TicketStateFormService, QueueFormService,
    TicketTypeService, TicketStateService, TicketPriorityService, QueueService, TicketTypeLabelProvider,
    TicketPriorityLabelProvider, TicketStateLabelProvider, TicketStateTypeLabelProvider, QueueLabelProvider,
    TicketPriorityTableFactory, TicketQueueTableFactory, TicketTypeTableFactory, TicketStateTableFactory,
    TicketTypeBrowserFactory, TicketPriorityBrowserFactory, TicketStateBrowserFactory, TicketStateTypeBrowserFactory,
    QueueBrowserFactory, TicketTypeCreateAction, NewTicketTypeDialogContext, TicketTypeEditAction,
    EditTicketTypeDialogContext, TicketTypeTableDeleteAction, TicketTypeDetailsContext, TicketStateCreateAction,
    NewTicketStateDialogContext, TicketStateEditAction, EditTicketStateDialogContext, TicketStateTableDeleteAction,
    TicketStateDetailsContext, TicketPriorityCreateAction, NewTicketPriorityDialogContext, TicketPriorityEditAction,
    EditTicketPriorityDialogContext, TicketPriorityTableDeleteAction, TicketPriorityDetailsContext,
    TicketQueueCreateAction, NewQueueDialogContext, TicketQueueEditAction, EditQueueDialogContext, QueueDetailsContext
} from ".";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ChannelLabelProvider } from "./ChannelLabelProvider";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";

export class UIModule implements IUIModule {

    public priority: number = 104;

    public name: string = 'TicketAdminUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketTypeFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateFormService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueFormService.getInstance());

        ServiceRegistry.registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueService.getInstance());

        LabelService.getInstance().registerLabelProvider(new TicketTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketPriorityLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ChannelLabelProvider());
        LabelService.getInstance().registerLabelProvider(new QueueLabelProvider());

        TableFactoryService.getInstance().registerFactory(new TicketPriorityTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketQueueTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketTypeTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketStateTableFactory());

        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET_TYPE, TicketTypeBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_PRIORITY, TicketPriorityBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE, TicketStateBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE_TYPE, TicketStateTypeBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.QUEUE, QueueBrowserFactory.getInstance());

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
            false, 'new-ticket-type-dialog', ['tickettypes'], NewTicketTypeDialogContext
        );
        await ContextService.getInstance().registerContext(newTicketTypeContext);

        ActionFactory.getInstance().registerAction('ticket-admin-type-edit', TicketTypeEditAction);
        const editTicketTypeContext = new ContextDescriptor(
            EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-type-dialog', ['tickettypes'], EditTicketTypeDialogContext
        );
        await ContextService.getInstance().registerContext(editTicketTypeContext);

        ActionFactory.getInstance().registerAction('ticket-admin-type-table-delete', TicketTypeTableDeleteAction);

        const ticketTypeDetailsContextDescriptor = new ContextDescriptor(
            TicketTypeDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickettypes'], TicketTypeDetailsContext
        );
        await ContextService.getInstance().registerContext(ticketTypeDetailsContextDescriptor);
    }

    private async registerTicketStatesAdmin(): Promise<void> {

        ActionFactory.getInstance().registerAction('ticket-admin-state-create', TicketStateCreateAction);

        const newTicketStateContext = new ContextDescriptor(
            NewTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-state-dialog', ['ticketstates'], NewTicketStateDialogContext
        );
        await ContextService.getInstance().registerContext(newTicketStateContext);

        ActionFactory.getInstance().registerAction('ticket-admin-state-edit', TicketStateEditAction);

        const editTicketStateContext = new ContextDescriptor(
            EditTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-state-dialog', ['ticketstates'], EditTicketStateDialogContext
        );
        await ContextService.getInstance().registerContext(editTicketStateContext);

        ActionFactory.getInstance().registerAction('ticket-admin-state-table-delete', TicketStateTableDeleteAction);

        const ticketStateDetailsContextDescriptor = new ContextDescriptor(
            TicketStateDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['ticketstates'], TicketStateDetailsContext
        );
        await ContextService.getInstance().registerContext(ticketStateDetailsContextDescriptor);
    }

    private async registerTicketPrioritiesAdmin(): Promise<void> {

        ActionFactory.getInstance().registerAction('ticket-admin-priority-create', TicketPriorityCreateAction);

        const newTicketPriorityContext = new ContextDescriptor(
            NewTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-priority-dialog', ['priorities'], NewTicketPriorityDialogContext
        );
        await ContextService.getInstance().registerContext(newTicketPriorityContext);

        ActionFactory.getInstance().registerAction('ticket-admin-priority-edit', TicketPriorityEditAction);

        const editTicketPriorityContext = new ContextDescriptor(
            EditTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-priority-dialog', ['priorities'], EditTicketPriorityDialogContext
        );
        await ContextService.getInstance().registerContext(editTicketPriorityContext);

        ActionFactory.getInstance().registerAction('ticket-admin-priority-table-delete',
            TicketPriorityTableDeleteAction
        );

        const ticketPriorityDetailsContextDescriptor = new ContextDescriptor(
            TicketPriorityDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['priorities'], TicketPriorityDetailsContext
        );
        await ContextService.getInstance().registerContext(ticketPriorityDetailsContextDescriptor);
    }

    private async registerTicketQueuesAdmin(): Promise<void> {


        ActionFactory.getInstance().registerAction('ticket-admin-queue-create', TicketQueueCreateAction);

        const newQueueContext = new ContextDescriptor(
            NewQueueDialogContext.CONTEXT_ID, [KIXObjectType.QUEUE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-queue-dialog', ['queues'], NewQueueDialogContext
        );
        await ContextService.getInstance().registerContext(newQueueContext);

        ActionFactory.getInstance().registerAction('ticket-admin-queue-edit', TicketQueueEditAction);

        const editQueueContext = new ContextDescriptor(
            EditQueueDialogContext.CONTEXT_ID, [KIXObjectType.QUEUE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-queue-dialog', ['queues'], EditQueueDialogContext
        );
        await ContextService.getInstance().registerContext(editQueueContext);

        const ticketQueueDetailsContextDescriptor = new ContextDescriptor(
            QueueDetailsContext.CONTEXT_ID, [KIXObjectType.QUEUE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['queues'], QueueDetailsContext
        );
        await ContextService.getInstance().registerContext(ticketQueueDetailsContextDescriptor);
    }
}
