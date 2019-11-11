/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration,
    KIXObjectType, NotificationProperty, KIXObjectProperty, TableWidgetConfiguration, SortOrder,
    CRUD, TabWidgetConfiguration, ObjectInformationWidgetConfiguration, ContextType
} from '../../core/model';
import { NotificationDetailsContext } from '../../core/browser/notification/context';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NotificationDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const objectInfoConfig = new ObjectInformationWidgetConfiguration(
            'notification-details-object-info-config', 'Object Info Config', ConfigurationType.ObjectInformation,
            KIXObjectType.NOTIFICATION,
            [
                NotificationProperty.NAME,
                NotificationProperty.DATA_VISIBLE_FOR_AGENT,
                NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP,
                KIXObjectProperty.COMMENT,
                KIXObjectProperty.VALID_ID,
                KIXObjectProperty.CREATE_TIME,
                KIXObjectProperty.CREATE_BY,
                KIXObjectProperty.CHANGE_TIME,
                KIXObjectProperty.CHANGE_BY
            ],
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(objectInfoConfig);

        const notificationInfoLane = new WidgetConfiguration(
            'notification-details-object-info-widget', 'Object Info Widget', ConfigurationType.Widget,
            'notification-info-widget', 'Translatable#Notification Information', [],
            new ConfigurationDefinition('notification-details-object-info-config', ConfigurationType.ObjectInformation),
            null, false, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notificationInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'notification-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['notification-details-object-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLane = new WidgetConfiguration(
            'notification-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('notification-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLane);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'notification-details-filter-table-widget-config', 'Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.NOTIFICATION_FILTER, ['Field', SortOrder.UP], null, null, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableWidgetConfig);

        const notificationFilterWidget = new WidgetConfiguration(
            'notification-details-filter-table-widget', 'Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Filter', [],
            new ConfigurationDefinition(
                'notification-details-filter-table-widget-config', ConfigurationType.TableWidget
            ), null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notificationFilterWidget);

        const recipientsInfoConfig = new ObjectInformationWidgetConfiguration(
            'notification-details-recipients-info-config', 'Info Config', ConfigurationType.ObjectInformation,
            KIXObjectType.NOTIFICATION,
            [
                NotificationProperty.DATA_RECIPIENTS,
                NotificationProperty.DATA_RECIPIENT_AGENTS,
                NotificationProperty.DATA_RECIPIENT_ROLES,
                NotificationProperty.DATA_SEND_DESPITE_OOO,
                NotificationProperty.DATA_SEND_ONCE_A_DAY,
                NotificationProperty.DATA_CREATE_ARTICLE
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(recipientsInfoConfig);

        const notificationRecipientsWidget = new WidgetConfiguration(
            'notification-details-recipient-info-widget', 'Recipient Info Widget', ConfigurationType.Widget,
            'notification-label-widget', 'Translatable#Recipients', [],
            new ConfigurationDefinition(
                'notification-details-recipients-info-config', ConfigurationType.ObjectInformation
            ),
            null, true, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notificationRecipientsWidget);

        const methodsInfoConfig = new ObjectInformationWidgetConfiguration(
            'notification-details-notification-methods-info-config', 'Info Config', ConfigurationType.ObjectInformation,
            KIXObjectType.NOTIFICATION,
            [
                NotificationProperty.DATA_RECIPIENT_EMAIL,
                NotificationProperty.DATA_RECIPIENT_SUBJECT
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(methodsInfoConfig);

        const notificationMethodsWidget = new WidgetConfiguration(
            'notification-details-notification-methods-widget', 'Method Widget', ConfigurationType.Widget,
            'notification-label-widget', 'Translatable#Notification Options', [],
            new ConfigurationDefinition(
                'notification-details-notification-methods-info-config', ConfigurationType.ObjectInformation
            ), null, true, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notificationMethodsWidget);

        const notificationTextWidget = new WidgetConfiguration(
            'notification-details-text-widget', 'Text Widget', ConfigurationType.Widget,
            'notification-text-widget', 'Translatable#Notification Text', [],
            null, null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notificationTextWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [], [],
            [
                new ConfiguredWidget(
                    'notification-details-tab-widget', 'notification-details-tab-widget', null,
                    [new UIComponentPermission('system/communication/notifications', [CRUD.READ])]
                ),
                new ConfiguredWidget(
                    'notification-details-filter-table-widget', 'notification-details-filter-table-widget'
                ),
                new ConfiguredWidget(
                    'notification-details-recipient-info-widget', 'notification-details-recipient-info-widget'
                ),
                new ConfiguredWidget(
                    'notification-details-notification-methods-widget',
                    'notification-details-notification-methods-widget'
                ),
                new ConfiguredWidget('notification-details-text-widget', 'notification-details-text-widget')
            ],
            [],
            [
                'notification-create'
            ],
            [
                'notification-edit', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget(
                    'notification-details-object-info-widget', 'notification-details-object-info-widget'
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
