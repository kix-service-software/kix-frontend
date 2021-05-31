/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { Report } from '../model/Report';
import { ReportDefinition } from '../model/ReportDefinition';
import { ReportDefinitionProperty } from '../model/ReportDefinitionProperty';
import { ReportParameter } from '../model/ReportParamater';
import { ReportFormCreator } from '../webapp/core/form/ReportFormCreator';
import { ReportObjectCreator } from '../webapp/core/form/ReportObjectCreator';
import { MockData } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Report Object Creator', () => {

    describe('Create a Report Object for ReportDefinitionMock', () => {

        let report: Report;

        before(async () => {
            const form = new FormConfiguration('', '', [], KIXObjectType.REPORT, false, FormContext.NEW);
            await ReportFormCreator.createFormPages(form, MockData.ReportDefinitionMock as ReportDefinition);

            const formInstance = new FormInstance(null);
            (formInstance as any).form = form;

            const outputFormatField = formInstance.getFormFieldByProperty(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
            if (outputFormatField) {
                await formInstance.provideFormFieldValues([[outputFormatField.instanceId, ['CSV', 'JSON']]], null);
            }

            const mockParameterField = form.pages[0].groups[0].formFields.find((f) => f.id === 'MockParameter');
            if (mockParameterField) {
                await formInstance.provideFormFieldValues([[mockParameterField.instanceId, 'Test Value']], null);
            }

            const mockReferenceParameterField = form.pages[0].groups[0].formFields.find((f) => f.id === 'MockReferenceParameter');
            if (mockReferenceParameterField) {
                await formInstance.provideFormFieldValues([[mockReferenceParameterField.instanceId, 12]], null);
            }

            report = await ReportObjectCreator.createReportObject(formInstance, MockData.ReportDefinitionMock as ReportDefinition);
        });

        it('Should create the Report object', () => {
            expect(report).exist;
        });

        it('Should have the correct ReportDefinitionID', () => {
            expect(report.DefinitionID).equals(MockData.ReportDefinitionMock.ID);
        });

        it('Should have a config', () => {
            expect(report.Config).exist;
        });

        describe('Check Output Format Config', () => {
            let outputConfig: string[];

            before(() => {
                outputConfig = report.Config['OutputFormats'];
            });

            it('should have a output formats config', () => {
                expect(outputConfig).exist;
                expect(outputConfig).an('array');
            });

            it('should contain the correct formats', () => {
                expect(outputConfig.length).equals(2);
                expect(outputConfig.some((v) => v === 'CSV')).true;
                expect(outputConfig.some((v) => v === 'JSON')).true;
            });
        });

        describe('Check Parameter config', () => {

            let parameterConfig;

            before(() => {
                parameterConfig = report.Config['Parameters'];
            });

            it('Should have a parameter config', () => {
                expect(parameterConfig).exist;
            });

            it('Should contain the parameter MockParameter', () => {
                expect(parameterConfig['MockParameter']).exist;
            });

            it('Should have the correctvalue for parameter MockParameter', () => {
                expect(parameterConfig['MockParameter']).equals('Test Value');
            });

            it('Should contain the parameter MockReferenceParameter', () => {
                expect(parameterConfig['MockReferenceParameter']).exist;
            });

            it('Should have the correctvalue for parameter MockReferenceParameter', () => {
                expect(parameterConfig['MockReferenceParameter']).equals(12);
            });
        });
    });
});