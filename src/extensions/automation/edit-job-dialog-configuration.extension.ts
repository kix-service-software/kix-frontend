/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditJobDialogContext } from '../../core/browser/job';
import {
    JobProperty, KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty, FormFieldOption,
    ObjectReferenceOptions, DefaultSelectInputFormOption, TreeNode, WidgetConfiguration,
    ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import {
    FormFieldConfiguration, FormGroupConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditJobDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const editDialogWidget = new WidgetConfiguration(
            'job-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'edit-job-dialog', 'Translatable#Edit Ticket Job', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(editDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'job-edit-dialog-widget', 'job-edit-dialog-widget',
                        KIXObjectType.JOB, ContextMode.EDIT_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'job-edit-form';

        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-name',
                'Translatable#Name', JobProperty.NAME, null, true,
                'Translatable#Helptext_Admin_JobCreateEdit_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-comment',
                'Translatable#Name', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_JobCCreateEdit_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_JobCreateEdit_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ]
            )
        );
        configurations.push(
            new FormGroupConfiguration(
                'job-edit-form-group-information', 'Translatable#Job Information',
                [
                    'job-edit-form-field-name',
                    'job-edit-form-field-comment',
                    'job-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'job-edit-form-page-information', 'Translatable#Job Information',
                ['job-edit-form-group-information']
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-weekdays',
                'Translatable#Weekday(s)', JobProperty.EXEC_PLAN_WEEKDAYS, 'default-select-input', false,
                'Translatable#Helptext_Admin_JobCreateEdit_Days',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        [
                            new TreeNode("Mon", 'Translatable#Monday'),
                            new TreeNode("Tue", 'Translatable#Tuesday'),
                            new TreeNode("Wed", 'Translatable#Wednesday'),
                            new TreeNode("Thu", 'Translatable#Thursday'),
                            new TreeNode("Fri", 'Translatable#Friday'),
                            new TreeNode("Sat", 'Translatable#Saturday'),
                            new TreeNode("Sun", 'Translatable#Sunday')
                        ]
                    ),
                    new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-times',
                'Translatable#Time', JobProperty.EXEC_PLAN_WEEKDAYS_TIMES, 'default-select-input', false,
                'Translatable#Helptext_Admin_JobCCreateEdit_Time',
                [
                    new FormFieldOption(DefaultSelectInputFormOption.NODES, this.getTimes()),
                    new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                ]
            )
        );
        configurations.push(
            new FormGroupConfiguration(
                'job-edit-form-group-time_based', 'Translatable#Time Based Execution',
                [
                    'job-edit-form-field-weekdays',
                    'job-edit-form-field-times'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-events',
                'Translatable#Events', JobProperty.EXEC_PLAN_EVENTS, 'job-input-events', false,
                'Translatable#Helptext_Admin_JobCreateEdit_Events'
            )
        );
        configurations.push(
            new FormGroupConfiguration(
                'job-edit-form-group-event_based', 'Translatable#Event Based Execution',
                ['job-edit-form-field-events']
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'job-edit-form-page-execution-plan', 'Translatable#Execution Plan',
                ['job-edit-form-group-time_based', 'job-edit-form-group-event_based']
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-filters',
                'Translatable#Filter', JobProperty.FILTER, 'job-input-filter', false,
                'Translatable#Helptext_Admin_JobCreateEdit_Filter'
            )
        );
        configurations.push(
            new FormGroupConfiguration(
                'job-edit-form-group-filters', 'Translatable#Filter',
                ['job-edit-form-field-filters']
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'job-edit-form-page-filters', 'Translatable#Filter',
                ['job-edit-form-group-filters']
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'job-edit-form-field-actions',
                '1. Action', JobProperty.MACRO_ACTIONS, 'job-input-actions', false,
                'Translatable#Helptext_Admin_JobCreateEdit_Actions', undefined, undefined, undefined, undefined,
                undefined, 1, 200, 0
            )
        );
        configurations.push(
            new FormGroupConfiguration(
                'job-edit-form-group-actions', 'Translatable#Actions',
                ['job-edit-form-field-actions'],
                undefined, undefined, true
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'job-edit-form-page-actions', 'Translatable#Actions',
                ['job-edit-form-group-actions']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Ticket Job',
                [
                    'job-edit-form-page-information',
                    'job-edit-form-page-execution-plan',
                    'job-edit-form-page-filters',
                    'job-edit-form-page-actions'
                ],
                KIXObjectType.JOB, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.JOB, formId);

        return configurations;
    }

    private getTimes(): TreeNode[] {
        const timeNodes = [];
        [...Array(24)].forEach((v, i) => {
            const hour = i < 10 ? '0' + i.toString() : i;
            timeNodes.push(new TreeNode(hour + ':00:00', i + ':00'));
            timeNodes.push(new TreeNode(hour + ':30:00', i + ':30'));
        });
        return timeNodes;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};