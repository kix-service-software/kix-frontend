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
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration, ObjectinformationWidgetSettings,
    KIXObjectType, MailFilterProperty, KIXObjectProperty, TableWidgetSettings, SortOrder, TabWidgetSettings, CRUD
} from '../../core/model';
import { MailFilterDetailsContext } from '../../core/browser/mail-filter/context';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return MailFilterDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('mail-filter-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['mail-filter-information-lane']))
        );

        const mailFilterInfoLane = new ConfiguredWidget('mail-filter-information-lane',
            new WidgetConfiguration(
                'object-information-widget', 'Translatable#Email Filter Information',
                ['mail-filter-edit'],
                new ObjectinformationWidgetSettings(
                    KIXObjectType.MAIL_FILTER,
                    [
                        MailFilterProperty.NAME,
                        MailFilterProperty.STOP_AFTER_MATCH,
                        KIXObjectProperty.COMMENT,
                        KIXObjectProperty.VALID_ID,
                        KIXObjectProperty.CREATE_BY,
                        KIXObjectProperty.CREATE_TIME,
                        KIXObjectProperty.CHANGE_BY,
                        KIXObjectProperty.CHANGE_TIME
                    ]
                ),
                false, true, null, false
            ),
            [new UIComponentPermission('system/communication/mailfilters', [CRUD.READ])]
        );

        const mailFilterMatchWidget = new ConfiguredWidget('mail-filter-match-widget',
            new WidgetConfiguration(
                'table-widget', 'Translatable#Filter Conditions', [],
                new TableWidgetSettings(
                    KIXObjectType.MAIL_FILTER_MATCH, ['Key', SortOrder.UP], undefined, undefined, false
                ),
                true, true, null, true
            )
        );

        const mailFilterSetWidget = new ConfiguredWidget('mail-filter-set-widget', new WidgetConfiguration(
            'table-widget', 'Translatable#Set Email Headers', [],
            new TableWidgetSettings(
                KIXObjectType.MAIL_FILTER_SET, ['Key', SortOrder.UP], undefined, undefined, false
            ),
            false, true, null, true)
        );

        const lanes = [
            'mail-filter-details-tab-widget', 'mail-filter-match-widget', 'mail-filter-set-widget'
        ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            tabLane, mailFilterInfoLane, mailFilterMatchWidget, mailFilterSetWidget
        ];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            [], [],
            ['mail-filter-create'],
            ['mail-filter-edit', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
