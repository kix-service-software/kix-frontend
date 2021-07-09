/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NotificationDetailsContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { NotificationProperty } from './model/NotificationProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { SortOrder } from '../../model/SortOrder';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';


import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NotificationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
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
        configurations.push(objectInfoConfig);

        const notificationInfoLane = new WidgetConfiguration(
            'notification-details-object-info-widget', 'Object Info Widget', ConfigurationType.Widget,
            'notification-info-widget', 'Translatable#Notification Information', [],
            new ConfigurationDefinition('notification-details-object-info-config', ConfigurationType.ObjectInformation),
            null, false, true
        );
        configurations.push(notificationInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'notification-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['notification-details-object-info-widget']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'notification-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('notification-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'notification-details-filter-table-widget-config', 'Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.NOTIFICATION_FILTER, ['Field', SortOrder.UP], null, null, null, false
        );
        configurations.push(tableWidgetConfig);

        const notificationFilterWidget = new WidgetConfiguration(
            'notification-details-filter-table-widget', 'Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Filter', [],
            new ConfigurationDefinition(
                'notification-details-filter-table-widget-config', ConfigurationType.TableWidget
            ), null, false, true, null, true
        );
        configurations.push(notificationFilterWidget);

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
        configurations.push(recipientsInfoConfig);

        const notificationRecipientsWidget = new WidgetConfiguration(
            'notification-details-recipient-info-widget', 'Recipient Info Widget', ConfigurationType.Widget,
            'notification-label-widget', 'Translatable#Recipients', [],
            new ConfigurationDefinition(
                'notification-details-recipients-info-config', ConfigurationType.ObjectInformation
            ),
            null, true, true, null, true
        );
        configurations.push(notificationRecipientsWidget);

        const methodsInfoConfig = new ObjectInformationWidgetConfiguration(
            'notification-details-notification-methods-info-config', 'Info Config', ConfigurationType.ObjectInformation,
            KIXObjectType.NOTIFICATION,
            [
                NotificationProperty.DATA_RECIPIENT_EMAIL,
                NotificationProperty.DATA_RECIPIENT_SUBJECT
            ]
        );
        configurations.push(methodsInfoConfig);

        const notificationMethodsWidget = new WidgetConfiguration(
            'notification-details-notification-methods-widget', 'Method Widget', ConfigurationType.Widget,
            'notification-label-widget', 'Translatable#Notification Options', [],
            new ConfigurationDefinition(
                'notification-details-notification-methods-info-config', ConfigurationType.ObjectInformation
            ), null, true, true, null, true
        );
        configurations.push(notificationMethodsWidget);

        const notificationTextWidget = new WidgetConfiguration(
            'notification-details-text-widget', 'Text Widget', ConfigurationType.Widget,
            'notification-text-widget', 'Translatable#Notification Text', [],
            null, null, false, true, null, true
        );
        configurations.push(notificationTextWidget);

        configurations.push(
            new ContextConfiguration(
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
                    'notification-edit'
                ],
                [],
                [
                    new ConfiguredWidget(
                        'notification-details-object-info-widget', 'notification-details-object-info-widget'
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
