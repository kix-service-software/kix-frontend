/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { Role } from '../../user/model/Role';
import { ReportDefinition } from '../model/ReportDefinition';
import { ReportParameter } from '../model/ReportParamater';
import { ReportDefinitionFormCreator } from '../webapp/core/form/ReportDefinitionFormCreator';
import { ReportDefintionObjectCreator } from '../webapp/core/form/ReportDefintionObjectCreator';
import { MockData } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Report Definition Object Creator', () => {

    let formInstance: FormInstance;
    let originalLoadObjects;

    before(async () => {
        originalLoadObjects = KIXObjectService.loadObjects;

        KIXObjectService.loadObjects = async <T>(objectType: KIXObjectType, objectIds: Array<string | number>): Promise<T[]> => {
            if (objectType === KIXObjectType.ROLE) {
                const role = new Role();
                role.ID = 1;
                return [role] as any[];
            } else if (objectType === KIXObjectType.REPORT_DATA_SOURCE && Array.isArray(objectIds) && objectIds.length && objectIds[0] === 'GenericSQL') {
                return [MockData.GenericSQLMock] as any[];
            } else if (objectType === KIXObjectType.REPORT_OUTPUT_FORMAT && Array.isArray(objectIds) && objectIds.length) {
                if (objectIds[0] === 'CSV') {
                    return [MockData.OutputFormatsMock[0]] as any[];
                } else if (objectIds[0] === 'JSON') {
                    return [MockData.OutputFormatsMock[1]] as any[];
                }
            }
            return [];
        }

        formInstance = new FormInstance(null);
        const form = new FormConfiguration('', '', [], KIXObjectType.REPORT_DEFINITION, false, FormContext.NEW);
        (formInstance as any).form = form;
        await ReportDefinitionFormCreator.createFormPages(form, MockData.ReportDefinitionMock as ReportDefinition, formInstance);

        (formInstance as any).form = form;

        for (const p of form.pages) {
            for (const g of p.groups) {
                for (const f of g.formFields) {
                    await setFormValues(f, formInstance);
                }
            }
        }
    });

    after(() => {
        KIXObjectService.loadObjects = originalLoadObjects;
    });

    describe("Create a Report Definition Object based on a form", () => {

        let reportDefiniton: ReportDefinition;

        before(async () => {
            reportDefiniton = await ReportDefintionObjectCreator.createReportDefinitionObject(formInstance);
        });

        it('Should create Report Definition Object', () => {
            expect(reportDefiniton).exist;
        });

        it('Should have the correct name', () => {
            expect(reportDefiniton.Name).equals(MockData.ReportDefinitionMock.Name);
        });

        it('Should have the correct comment', () => {
            expect(reportDefiniton.Comment).equals(MockData.ReportDefinitionMock.Comment);
        });

        it('Should have the correct valid value', () => {
            expect(reportDefiniton.ValidID).equals(MockData.ReportDefinitionMock.ValidID);
        });

        it('Should have a config object', () => {
            expect(reportDefiniton.Config).exist;
        });

        describe('Check Datasource config', () => {

            let dataSourceConfig: any;

            before(() => {
                dataSourceConfig = reportDefiniton.Config['DataSource'];
            });

            it('Should have a datasource config', () => {
                expect(dataSourceConfig).exist;
            });

            describe('Check SQL Config', () => {

                let sqlConfig: any;

                before(() => {
                    sqlConfig = dataSourceConfig['SQL'];
                });

                it('Should have a SQL config', () => {
                    expect(sqlConfig).exist;
                });

                describe('Check SQL config value (any)', () => {

                    let sqlValue: any;

                    before(() => {
                        sqlValue = sqlConfig['any'];
                    });

                    it('Should have a sql value', () => {
                        expect(sqlValue).exist;
                    });

                    it('Should have the correct sql value', () => {
                        expect(sqlValue).equals(MockData.ReportDefinitionMock.Config.DataSource.SQL.any);
                    });
                });
            });
        });

        describe('Check Parameters config', () => {

            let parmatersConfig: ReportParameter[];

            before(() => {
                parmatersConfig = reportDefiniton.Config['Parameters'];
            });

            it('Should have a parmaters config', () => {
                expect(parmatersConfig).exist;
                expect(parmatersConfig).an('array');
            });

            it('Should contains correct parameters count', () => {
                expect(parmatersConfig.length).equals(MockData.ReportDefinitionMock.Config.Parameters.length);
            });

            describe('Check MockParameter', () => {

                let parameter: ReportParameter;
                let mockParameter: ReportParameter;

                before(() => {
                    parameter = parmatersConfig[0];
                    mockParameter = MockData.ReportDefinitionMock.Config.Parameters[0] as any;
                });

                it('Should have MockParameter', () => {
                    expect(parameter).exist;
                });

                it('Should have the correct name', () => {
                    expect(parameter.Name).equals(mockParameter.Name);
                });

                it('Should have the correct label', () => {
                    expect(parameter.Label).equals(mockParameter.Label);
                });

                it('Should have the correct description', () => {
                    expect(parameter.Description).equals(mockParameter.Description);
                });

                it('Should have the correct required', () => {
                    expect(parameter.Required).equals(mockParameter.Required);
                });

                it('Should have the correct multiple', () => {
                    expect(parameter.Multiple).equals(mockParameter.Multiple);
                });

                it('Should have the correct readonly', () => {
                    expect(parameter.ReadOnly).equals(mockParameter.ReadOnly);
                });

                it('Should have the correct references', () => {
                    expect(parameter.References).equals(mockParameter.References);
                });

                it('Should have the correct possible values', () => {
                    expect(parameter.PossibleValues).exist;
                    expect(parameter.PossibleValues).an('array');
                    expect(parameter.PossibleValues.length).equals(4);
                    expect(parameter.PossibleValues.some((v) => v === 'a')).true;
                    expect(parameter.PossibleValues.some((v) => v === 'b')).true;
                    expect(parameter.PossibleValues.some((v) => v === 'c')).true;
                    expect(parameter.PossibleValues.some((v) => v === 'd')).true;
                });

                it('Should have the correct default value', () => {
                    expect(parameter.Default).equals(mockParameter.Default);
                });
            });

            describe('Check MockReferenceParameter', () => {

                let parameter: ReportParameter;
                let mockParameter: ReportParameter;

                before(() => {
                    parameter = parmatersConfig[1];
                    mockParameter = MockData.ReportDefinitionMock.Config.Parameters[1] as any;
                });

                it('Should have MockParameter', () => {
                    expect(parameter).exist;
                });

                it('Should have the correct name', () => {
                    expect(parameter.Name).equals(mockParameter.Name);
                });

                it('Should have the correct label', () => {
                    expect(parameter.Label).equals(mockParameter.Label);
                });

                it('Should have the correct description', () => {
                    expect(parameter.Description).equals(mockParameter.Description);
                });

                it('Should have the correct required', () => {
                    expect(parameter.Required).equals(mockParameter.Required);
                });

                it('Should have the correct multiple', () => {
                    expect(parameter.Multiple).equals(mockParameter.Multiple);
                });

                it('Should have the correct readonly', () => {
                    expect(parameter.ReadOnly).equals(mockParameter.ReadOnly);
                });

                it('Should have the correct references', () => {
                    expect(parameter.References).equals(mockParameter.References);
                });

                it('Should have the correct possible values', () => {
                    expect(parameter.PossibleValues).exist;
                    expect(parameter.PossibleValues).an('array');
                    expect(parameter.PossibleValues.length).equals(3);
                    expect(parameter.PossibleValues.some((v) => v === 10)).true;
                    expect(parameter.PossibleValues.some((v) => v === 12)).true;
                    expect(parameter.PossibleValues.some((v) => v === 13)).true;
                });

                it('Should have the correct default value', () => {
                    expect(parameter.Default).equals(mockParameter.Default);
                });
            });
        });
    });
});

async function setFormValues(field: FormFieldConfiguration, formInstance: FormInstance): Promise<void> {
    if (field.defaultValue) {
        await formInstance.provideFormFieldValues([[field.instanceId, field.defaultValue.value]], null, true);
    }

    if (Array.isArray(field.children) && field.children.length) {
        for (const f of field.children) {
            await setFormValues(f, formInstance);
        }
    }
}