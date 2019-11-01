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
    KIXObjectType, MailAccountProperty, KIXObjectProperty, ObjectInformationWidgetConfiguration, TabWidgetConfiguration
} from '../../core/model';
import { MailAccountDetailsContext } from '../../core/browser/mail-account/context';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return MailAccountDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const objectInfoConfig = new ObjectInformationWidgetConfiguration(
            'mail-account-details-object-info-config', 'Info Config', ConfigurationType.ObjectInformation,
            KIXObjectType.MAIL_ACCOUNT,
            [
                MailAccountProperty.LOGIN,
                MailAccountProperty.HOST,
                MailAccountProperty.TYPE,
                MailAccountProperty.IMAP_FOLDER,
                MailAccountProperty.TRUSTED,
                MailAccountProperty.DISPATCHING_BY,
                MailAccountProperty.COMMENT,
                KIXObjectProperty.VALID_ID,
                KIXObjectProperty.CREATE_BY,
                KIXObjectProperty.CREATE_TIME,
                KIXObjectProperty.CHANGE_BY,
                KIXObjectProperty.CHANGE_TIME
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(objectInfoConfig);

        const mailAccountInfoLane = new WidgetConfiguration(
            'mail-account-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'mail-account-info-widget', 'Translatable#Account Information',
            [],
            new ConfigurationDefinition('mail-account-details-object-info-config', ConfigurationType.ObjectInformation),
            null, false, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(mailAccountInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'mail-account-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['mail-account-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLane = new WidgetConfiguration(
            'mail-account-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('mail-account-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLane);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [], [],
            [
                new ConfiguredWidget('mail-account-details-tab-widget', 'mail-account-details-tab-widget')
            ], [],
            [
                'mail-account-create'
            ],
            [
                'mail-account-edit', 'mail-account-fetch', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('mail-account-details-info-widget', 'mail-account-details-info-widget')
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
