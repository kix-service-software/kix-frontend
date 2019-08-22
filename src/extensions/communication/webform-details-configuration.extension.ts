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
    KIXObjectType, KIXObjectProperty
} from '../../core/model';
import { TabWidgetSettings } from '../../core/model/components/TabWidgetSettings';
import { WebformProperty } from '../../core/model/webform';
import { WebformDetailsContext } from '../../core/browser/webform/context/WebformDetailsContext';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return WebformDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('webform-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['webform-options-lane']))
        );

        const webformOptionsLane = new ConfiguredWidget('webform-options-lane',
            new WidgetConfiguration(
                'object-information-widget', 'Translatable#Webform Options', [],
                new ObjectInformationWidgetSettings(KIXObjectType.WEBFORM, [
                    WebformProperty.BUTTON_LABEL,
                    WebformProperty.TITLE,
                    WebformProperty.SHOW_TITLE,
                    WebformProperty.HINT_MESSAGE,
                    WebformProperty.SAVE_LABEL,
                    WebformProperty.SUCCESS_MESSAGE,
                    WebformProperty.MODAL,
                    WebformProperty.USE_KIX_CSS,
                    WebformProperty.ALLOW_ATTACHMENTS,
                    KIXObjectProperty.VALID_ID,
                    KIXObjectProperty.CREATE_BY,
                    KIXObjectProperty.CREATE_TIME,
                    KIXObjectProperty.CHANGE_BY,
                    KIXObjectProperty.CHANGE_TIME
                ]),
                false, true, null, false
            )
        );

        const defaultValuesLane = new ConfiguredWidget('webform-default-values-lane',
            new WidgetConfiguration(
                'object-information-widget', 'Translatable#Default Values', [],
                new ObjectInformationWidgetSettings(KIXObjectType.WEBFORM, [
                    WebformProperty.QUEUE_ID,
                    WebformProperty.PRIORITY_ID,
                    WebformProperty.TYPE_ID,
                    WebformProperty.STATE_ID,
                    WebformProperty.USER_ID
                ]),
                false, true, null, false
            )
        );

        const codeLane = new ConfiguredWidget('webform-code-lane',
            new WidgetConfiguration('webform-code-widget', 'Translatable#Code', [], null, true)
        );

        return new ContextConfiguration(
            WebformDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['webform-details-tab-widget', 'webform-default-values-lane', 'webform-code-lane'],
            [tabLane, webformOptionsLane, defaultValuesLane, codeLane],
            [], [],
            ['webform-create-action'], []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
