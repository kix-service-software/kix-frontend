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
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { NewReportDefinitionDialogContext } from './webapp/core/context/NewReportDefinitionDialogContext';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewReportDefinitionDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'report-definition-new-dialog-widget', 'New Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Report Definition', [], null, null,
            false, false, 'kix-icon-plus-blank'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'report-definition-new-dialog-widget', 'report-definition-new-dialog-widget',
                        KIXObjectType.REPORT_DEFINITION, ContextMode.CREATE
                    )
                ], [], [], [], []

            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'report-definition-new-form';

        configurations.push(
            new FormConfiguration(formId, 'Translatable#New Report Definition', [], KIXObjectType.REPORT_DEFINITION)
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.NEW], KIXObjectType.REPORT_DEFINITION, formId
        );

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
