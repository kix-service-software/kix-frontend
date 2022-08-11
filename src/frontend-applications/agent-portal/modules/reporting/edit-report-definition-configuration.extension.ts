/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { EditReportDefinitionContext } from './webapp/core/context/EditReportDefinitionDialogContext';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { FormContext } from '../../model/configuration/FormContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditReportDefinitionContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'report-definition-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Report', [], null, null,
            false, false, 'kix-icon-kpi'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'report-definition-edit-dialog-widget', 'report-definition-edit-dialog-widget',
                        KIXObjectType.REPORT_DEFINITION, ContextMode.EDIT
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'report-definition-edit-form';

        configurations.push(
            new FormConfiguration(formId, 'Translatable#Edit Report Definition', [], KIXObjectType.REPORT_DEFINITION)
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.REPORT_DEFINITION, formId
        );

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
