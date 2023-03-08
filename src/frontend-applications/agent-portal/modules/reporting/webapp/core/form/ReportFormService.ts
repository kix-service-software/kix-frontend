/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectSpecificCreateOptions } from '../../../../../model/KIXObjectSpecificCreateOptions';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { KIXObjectFormService } from '../../../../base-components/webapp/core/KIXObjectFormService';
import { Report } from '../../../model/Report';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { NewReportDialogContext } from '../context/NewReportDialogContext';
import { ReportFormCreator } from './ReportFormCreator';
import { ReportObjectCreator } from './ReportObjectCreator';

export class ReportFormService extends KIXObjectFormService {

    private static INSTANCE: ReportFormService;

    public static getInstance(): ReportFormService {
        if (!ReportFormService.INSTANCE) {
            ReportFormService.INSTANCE = new ReportFormService();
        }
        return ReportFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: string): boolean {
        return kixObjectType === KIXObjectType.REPORT;
    }

    protected async prePrepareForm(
        form: FormConfiguration, reportDefinition: Report, formInstance: FormInstance
    ): Promise<void> {
        const context = await ContextService.getInstance().getActiveContext<NewReportDialogContext>();
        const definition = context?.getAdditionalInformation(KIXObjectType.REPORT_DEFINITION);
        const outputFormat = context?.getAdditionalInformation(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);

        if (definition) {
            await ReportFormCreator.createFormPages(form, definition, outputFormat);
        }
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions: KIXObjectSpecificCreateOptions,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        parameter = await super.postPrepareValues(parameter, createOptions, formContext, formInstance);

        const context = ContextService.getInstance().getActiveContext();
        const definition = context?.getAdditionalInformation(KIXObjectType.REPORT_DEFINITION);

        const report = await ReportObjectCreator.createReportObject(formInstance, definition);
        parameter = [[KIXObjectType.REPORT, report]];

        return parameter;
    }

}
