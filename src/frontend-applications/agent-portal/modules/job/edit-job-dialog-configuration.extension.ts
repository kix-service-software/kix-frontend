/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditJobDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditJobDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const editDialogWidget = new WidgetConfiguration(
            'job-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Job', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(editDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'job-edit-dialog-widget', 'job-edit-dialog-widget',
                        KIXObjectType.JOB, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'job-edit-form';
        configurations.push(
            new FormConfiguration(formId, 'Translatable#Edit Job', [], KIXObjectType.JOB, true, FormContext.EDIT)
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.JOB, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
