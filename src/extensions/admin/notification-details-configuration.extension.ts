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
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration, ObjectInformationWidgetSettings,
    KIXObjectType, NotificationProperty, KIXObjectProperty, TableWidgetSettings, SortOrder, TabWidgetSettings, CRUD
} from '../../core/model';
import { NotificationDetailsContext } from '../../core/browser/notification/context';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NotificationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('notification-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['notification-information-lane']))
        );

        const notificationInfoLane = new ConfiguredWidget('notification-information-lane',
            new WidgetConfiguration(
                'notification-info-widget', 'Translatable#Notification Information',
                [],
                new ObjectInformationWidgetSettings(
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
                ),
                false, true
            ),
            [new UIComponentPermission('system/communication/notifications', [CRUD.READ])]
        );

        const notificationFilterWidget = new ConfiguredWidget('notification-filter-widget',
            new WidgetConfiguration(
                'table-widget', 'Translatable#Filter', [],
                new TableWidgetSettings(
                    KIXObjectType.NOTIFICATION_FILTER, ['Field', SortOrder.UP], undefined, undefined, false
                ),
                false, true, null, true
            )
        );

        const notificationRecipientsWidget = new ConfiguredWidget('notification-recipients-widget',
            new WidgetConfiguration(
                'notification-label-widget', 'Translatable#Recipients', [],
                new ObjectInformationWidgetSettings(
                    KIXObjectType.NOTIFICATION,
                    [
                        NotificationProperty.DATA_RECIPIENTS,
                        NotificationProperty.DATA_RECIPIENT_AGENTS,
                        NotificationProperty.DATA_RECIPIENT_ROLES,
                        NotificationProperty.DATA_SEND_DESPITE_OOO,
                        NotificationProperty.DATA_SEND_ONCE_A_DAY,
                        NotificationProperty.DATA_CREATE_ARTICLE
                    ]
                ),
                true, true, null, true
            )
        );

        const notificationOptionsWidget = new ConfiguredWidget('notification-options-widget',
            new WidgetConfiguration(
                'notification-label-widget', 'Translatable#Notification Options', [],
                new ObjectInformationWidgetSettings(
                    KIXObjectType.NOTIFICATION,
                    [
                        NotificationProperty.DATA_RECIPIENT_EMAIL,
                        NotificationProperty.DATA_RECIPIENT_SUBJECT
                    ]
                ),
                true, true, null, true
            )
        );

        const notificationTextWidget = new ConfiguredWidget('notification-text-widget',
            new WidgetConfiguration(
                'notification-text-widget', 'Translatable#Notification Text', [],
                null, false, true, null, true
            )
        );

        const lanes = [
            'notification-details-tab-widget', 'notification-filter-widget', 'notification-recipients-widget',
            'notification-options-widget', 'notification-text-widget'
        ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            tabLane, notificationInfoLane, notificationFilterWidget, notificationRecipientsWidget,
            notificationOptionsWidget, notificationTextWidget
        ];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            [], [],
            ['notification-create'],
            ['notification-edit', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
