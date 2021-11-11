/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { NewReportDialogContext } from './webapp/core/context/NewReportDialogContext';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewReportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'report-new-dialog-widget', 'New Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Report', [], null, null,
            false, false, 'kix-icon-kpi'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'report-new-dialog-widget', 'report-new-dialog-widget',
                        KIXObjectType.REPORT, ContextMode.CREATE_SUB
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'report-new-form';

        configurations.push(new FormConfiguration(formId, 'Translatable#New Report', [], KIXObjectType.REPORT));
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.REPORT, formId);

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
