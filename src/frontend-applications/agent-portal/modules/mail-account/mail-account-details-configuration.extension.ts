/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { MailAccountDetailsContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { MailAccountProperty } from './model/MailAccountProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return MailAccountDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const objectInfoConfig = new ObjectInformationWidgetConfiguration(
            'mail-account-details-object-info-config', 'Info Config', ConfigurationType.ObjectInformation,
            KIXObjectType.MAIL_ACCOUNT,
            [
                MailAccountProperty.LOGIN,
                MailAccountProperty.HOST,
                MailAccountProperty.TYPE,
                MailAccountProperty.OAUTH2_PROFILEID,
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
        configurations.push(objectInfoConfig);

        const mailAccountInfoLane = new WidgetConfiguration(
            'mail-account-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'mail-account-info-widget', 'Translatable#Account Information',
            [],
            new ConfigurationDefinition('mail-account-details-object-info-config', ConfigurationType.ObjectInformation),
            null, false, true
        );
        configurations.push(mailAccountInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'mail-account-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['mail-account-details-info-widget']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'mail-account-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('mail-account-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        configurations.push(
            new ContextConfiguration(
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
                    'mail-account-edit', 'mail-account-fetch'
                ],
                [],
                [
                    new ConfiguredWidget('mail-account-details-info-widget', 'mail-account-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
