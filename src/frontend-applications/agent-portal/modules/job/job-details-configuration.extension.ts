/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { JobProperty } from './model/JobProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'job-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new ObjectInformationWidgetConfiguration(
                'job-details-object-info-config', 'Object Info Config', ConfigurationType.ObjectInformation,
                KIXObjectType.JOB,
                [
                    JobProperty.TYPE,
                    JobProperty.NAME,
                    JobProperty.LAST_EXEC_TIME,
                    KIXObjectProperty.COMMENT,
                    KIXObjectProperty.VALID_ID,
                    KIXObjectProperty.CREATE_TIME,
                    KIXObjectProperty.CREATE_BY,
                    KIXObjectProperty.CHANGE_TIME,
                    KIXObjectProperty.CHANGE_BY
                ]
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'job-details-info-widget', 'Job Information', ConfigurationType.Widget,
                'object-information-widget', 'Translatable#Job Information', [],
                new ConfigurationDefinition('job-details-object-info-config', ConfigurationType.ObjectInformation)
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'job-details-run-history-widget', 'Run History Widget', ConfigurationType.Widget,
                'job-run-history-widget', 'Translatable#History', [],
                new ConfigurationDefinition('job-details-run-history-config', ConfigurationType.Table),
                null, false, false, null, false
            )
        );

        configurations.push(
            new TabWidgetConfiguration(
                'job-details-tab-widget-config', 'Tab widget config', ConfigurationType.TabWidget,
                [
                    'job-details-info-widget',
                    'job-details-run-history-widget'
                ]
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'job-details-tab-widget', 'Tab widget', ConfigurationType.Widget,
                'tab-widget', '', [],
                new ConfigurationDefinition('job-details-tab-widget-config', ConfigurationType.TabWidget),
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'job-details-exec-plans-widget', 'Exec Plan Widget', ConfigurationType.Widget,
                'job-details-exec-plans-widget', 'Translatable#Execution Plan', []
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'job-details-filter-widget', 'Table Widget', ConfigurationType.Widget,
                'job-details-filter-widget', 'Translatable#Filter', [],
                null, null, false, true, null, true
            )
        );

        configurations.push(
            new TableWidgetConfiguration(
                'job-details-actions-table-widget-config', 'Widget Config', ConfigurationType.TableWidget,
                KIXObjectType.MACRO_ACTION, null, null, null, null, false
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'job-details-actions-widget', 'Actions Widget', ConfigurationType.Widget,
                'table-widget', 'Translatable#Actions', [],
                new ConfigurationDefinition(
                    'job-details-actions-table-widget-config', ConfigurationType.TableWidget
                ), null, false, true, null, true
            )
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('job-details-tab-widget', 'job-details-tab-widget'),
                    new ConfiguredWidget('job-details-exec-plans-widget', 'job-details-exec-plans-widget'),
                    new ConfiguredWidget('job-details-filter-widget', 'job-details-filter-widget'),
                    new ConfiguredWidget('job-details-actions-widget', 'job-details-actions-widget')
                ],
                [],
                ['job-create-action'], ['job-edit-action', 'job-execute-action'],
                [],
                [
                    new ConfiguredWidget('job-details-info-widget', 'job-details-info-widget'),
                    new ConfiguredWidget(
                        'job-details-run-history-widget', 'job-details-run-history-widget', null
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

module.exports = (data, host, options): Extension => {
    return new Extension();
};
