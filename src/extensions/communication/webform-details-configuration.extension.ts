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
    KIXObjectType, KIXObjectProperty
} from '../../core/model';
import { WebformProperty } from '../../core/model/webform';
import { WebformDetailsContext } from '../../core/browser/webform';
import { ConfigurationType } from '../../core/model/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return WebformDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        // const tabLane = new ConfiguredWidget('webform-details-tab-widget',
        //     new WidgetConfiguration(null,null,null,'tab-widget', '', [],
        // new TabWidgetConfiguration(['webform-options-lane']))
        // );

        // const webformOptionsLane = new ConfiguredWidget('webform-options-lane',
        //     new WidgetConfiguration(null,null,null,
        //         'object-information-widget', 'Translatable#Webform Options', [],
        //         new ObjectInformationWidgetSettings(KIXObjectType.WEBFORM, [
        //             WebformProperty.BUTTON_LABEL,
        //             WebformProperty.TITLE,
        //             WebformProperty.SHOW_TITLE,
        //             WebformProperty.HINT_MESSAGE,
        //             WebformProperty.SAVE_LABEL,
        //             WebformProperty.SUCCESS_MESSAGE,
        //             WebformProperty.MODAL,
        //             WebformProperty.USE_KIX_CSS,
        //             WebformProperty.ALLOW_ATTACHMENTS,
        //             WebformProperty.ACCEPTED_DOMAINS,
        //             KIXObjectProperty.VALID_ID,
        //             KIXObjectProperty.CREATE_BY,
        //             KIXObjectProperty.CREATE_TIME,
        //             KIXObjectProperty.CHANGE_BY,
        //             KIXObjectProperty.CHANGE_TIME
        //         ]),
        //         false, true, null, false
        //     )
        // );

        // const defaultValuesLane = new ConfiguredWidget('webform-default-values-lane',
        //     new WidgetConfiguration(null,null,null,
        //         'object-information-widget', 'Translatable#Default Values', [],
        //         new ObjectInformationWidgetSettings(KIXObjectType.WEBFORM, [
        //             WebformProperty.QUEUE_ID,
        //             WebformProperty.PRIORITY_ID,
        //             WebformProperty.TYPE_ID,
        //             WebformProperty.STATE_ID,
        //             WebformProperty.USER_LOGIN
        //         ]),
        //         false, true, null, false
        //     )
        // );

        // const codeLane = new ConfiguredWidget('webform-code-lane',
        //     new WidgetConfiguration(null,null,null,'webform-code-widget', 'Translatable#Code', [], null, true)
        // );

        // return new ContextConfiguration(
        //     WebformDetailsContext.CONTEXT_ID,
        //     [], [],
        //     [], [],
        //     ['webform-details-tab-widget', 'webform-default-values-lane', 'webform-code-lane'],
        //     [tabLane, webformOptionsLane, defaultValuesLane, codeLane],
        //     [], [],
        //     ['webform-create-action'], ['webform-edit-action', 'print-action']
        // );

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context, this.getModuleId()
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
