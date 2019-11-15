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
    KIXObjectType, KIXObjectProperty, ObjectInformationWidgetConfiguration, TabWidgetConfiguration
} from '../../core/model';
import { WebformProperty } from '../../core/model/webform';
import { WebformDetailsContext } from '../../core/browser/webform';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return WebformDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new WidgetConfiguration(
                'webform-details-object-info-widget', 'Object Info Widget', ConfigurationType.Widget,
                'object-information-widget', 'Translatable#Webform Options', [], null,
                new ObjectInformationWidgetConfiguration(
                    null, null, null,
                    KIXObjectType.WEBFORM,
                    [
                        WebformProperty.BUTTON_LABEL,
                        WebformProperty.TITLE,
                        WebformProperty.SHOW_TITLE,
                        WebformProperty.HINT_MESSAGE,
                        WebformProperty.SAVE_LABEL,
                        WebformProperty.SUCCESS_MESSAGE,
                        WebformProperty.MODAL,
                        WebformProperty.USE_KIX_CSS,
                        WebformProperty.ALLOW_ATTACHMENTS,
                        WebformProperty.ACCEPTED_DOMAINS,
                        KIXObjectProperty.VALID_ID,
                        KIXObjectProperty.CREATE_BY,
                        KIXObjectProperty.CREATE_TIME,
                        KIXObjectProperty.CHANGE_BY,
                        KIXObjectProperty.CHANGE_TIME
                    ]
                ),
                false, true, null, false
            )
        );

        configurations.push(
            new TabWidgetConfiguration(
                'webform-details-tab-widget-config', 'Tab Widget', ConfigurationType.TabWidget,
                ['webform-details-object-info-widget']
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'webform-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
                'tab-widget', '', [],
                new ConfigurationDefinition('webform-details-tab-widget-config', ConfigurationType.TabWidget)
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'webform-details-default-values', 'Object Info', ConfigurationType.Widget,
                'object-information-widget', 'Translatable#Default Values', [],
                null, new ObjectInformationWidgetConfiguration(
                    null, null, null,
                    KIXObjectType.WEBFORM,
                    [
                        WebformProperty.QUEUE_ID,
                        WebformProperty.PRIORITY_ID,
                        WebformProperty.TYPE_ID,
                        WebformProperty.STATE_ID,
                        WebformProperty.USER_LOGIN
                    ]
                ),
                false, true, null, false
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'webform-details-code-widget', 'Code Widget', ConfigurationType.Widget,
                'webform-code-widget', 'Translatable#Code', [], null, true)
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('webform-details-tab-widget', 'webform-details-tab-widget'),
                    new ConfiguredWidget('webform-details-default-values', 'webform-details-default-values'),
                    new ConfiguredWidget('webform-details-code-widget', 'webform-details-code-widget')
                ],
                [],
                ['webform-create-action'], ['webform-edit-action', 'print-action'],
                [],
                [
                    new ConfiguredWidget('webform-details-object-info-widget', 'webform-details-object-info-widget')
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
