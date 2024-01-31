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
import {
    NotificationService, NotificationTableFactory, NotificationLabelProvider,
    NotificationEmailRecipientValidator, NotificationFormService,
    NotificationFilterTableFactory, NotificationCreateAction, NewNotificationDialogContext,
    NotificationEditAction, EditNotificationDialogContext, NotificationDetailsContext,
    NotificationTableDeleteAction
} from '.';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormValidationService } from '../../../../modules/base-components/webapp/core/FormValidationService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { SetupService } from '../../../setup-assistant/webapp/core/SetupService';
import { SetupStep } from '../../../setup-assistant/webapp/core/SetupStep';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { NotificationFormFieldValueHandler } from './NotificationFormFieldValueHandler';
import { FormService } from '../../../base-components/webapp/core/FormService';

export class UIModule implements IUIModule {

    public name: string = 'NotificationUIModule';

    public priority: number = 9500;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(NotificationService.getInstance());
        TableFactoryService.getInstance().registerFactory(new NotificationTableFactory());
        LabelService.getInstance().registerLabelProvider(new NotificationLabelProvider());

        FormValidationService.getInstance().registerValidator(new NotificationEmailRecipientValidator());

        ServiceRegistry.registerServiceInstance(NotificationFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new NotificationFilterTableFactory());

        ActionFactory.getInstance().registerAction('notification-create', NotificationCreateAction);
        const newNotificationDialogContext = new ContextDescriptor(
            NewNotificationDialogContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['notifications'], NewNotificationDialogContext,
            [
                new UIComponentPermission('system/communication/notifications', [CRUD.CREATE])
            ],
            'Translatable#New Notification', 'kix-icon-gear', NotificationDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(newNotificationDialogContext);

        ActionFactory.getInstance().registerAction('notification-edit', NotificationEditAction);
        const editNotificationDialogContext = new ContextDescriptor(
            EditNotificationDialogContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['notifications'], EditNotificationDialogContext,
            [
                new UIComponentPermission('system/communication/notifications', [CRUD.CREATE])
            ],
            'Translatable#Edit Notification', 'kix-icon-gear', NotificationDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editNotificationDialogContext);

        FormService.getInstance().addFormFieldValueHandler(new NotificationFormFieldValueHandler());

        ActionFactory.getInstance().registerAction('notification-table-delete', NotificationTableDeleteAction);

        const notificationDetailsContext = new ContextDescriptor(
            NotificationDetailsContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['notifications'], NotificationDetailsContext,
            [
                new UIComponentPermission('system/communication/notifications', [CRUD.READ])
            ],
            'Translatable#Notification Details', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(notificationDetailsContext);

        SetupService.getInstance().registerSetupStep(
            new SetupStep('setup-notification-template', 'Translatable#Notification Template', 'setup-notification-template',
                [
                    new UIComponentPermission('system/config', [CRUD.READ])
                ],
                'Translatable#Define notification template', 'Translatable#setup_assistant_notification_template_text',
                'kix-icon-letter-blue', 60
            )
        );
    }

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
