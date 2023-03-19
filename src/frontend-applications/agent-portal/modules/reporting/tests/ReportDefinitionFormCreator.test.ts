/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { DefaultSelectInputFormOption } from '../../../model/configuration/DefaultSelectInputFormOption';
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { FormFieldOptions } from '../../../model/configuration/FormFieldOptions';
import { FormGroupConfiguration } from '../../../model/configuration/FormGroupConfiguration';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../base-components/webapp/core/tree';
import { Role } from '../../user/model/Role';
import { ReportDefinition } from '../model/ReportDefinition';
import { ReportDefinitionProperty } from '../model/ReportDefinitionProperty';
import { ReportParameterProperty } from '../model/ReportParameterProperty';
import { ReportDefinitionFormCreator } from '../webapp/core/form/ReportDefinitionFormCreator';
import { MockData } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Report Definition Form Creator', () => {

    describe('Create a default form without a given Report Definition', () => {

        let form: FormConfiguration;
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
                }
                return [];
            }

            form = new FormConfiguration('report-definition-test-form', 'report-definition-test-form', [], KIXObjectType.REPORT_DEFINITION);

            const formInstance = new FormInstance(null);
            (formInstance as any).form = form;
            await ReportDefinitionFormCreator.createFormPages(form, null, formInstance);
        });

        after(() => {
            KIXObjectService.loadObjects = originalLoadObjects;
        });

        it('should contain 3 form pages', () => {
            expect(form.pages).exist;
            expect(form.pages).an('array');
            expect(form.pages.length).equals(3);
        });

        describe('Common Page', () => {

            it('Should have a translatable title "Translatable#Report Information"', () => {
                expect(form.pages[0].name).equals('Translatable#Report Information');
            });

            describe('Form Group', () => {

                it('Should contain one group with fields', () => {
                    expect(form.pages[0].groups).exist;
                    expect(form.pages[0].groups).an('array');
                    expect(form.pages[0].groups.length).equals(1);
                    expect(form.pages[0].groups[0].formFields).exist;
                    expect(form.pages[0].groups[0].formFields).an('array');
                });

                describe('Title Field', () => {

                    let titleField: FormFieldConfiguration;

                    before(() => {
                        titleField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.NAME);
                    })

                    it('Should have a title field', () => {
                        expect(titleField).exist;
                    });

                    it('Should have a translatable label "Translatable#Title"', () => {
                        expect(titleField.label).equals('Translatable#Title');
                    });

                    it('Should be required', () => {
                        expect(titleField.required).true;
                    });
                });

                describe('Comment Field', () => {
                    let commentField: FormFieldConfiguration;

                    before(() => {
                        commentField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.COMMENT);
                    });

                    it('Should have a comment field', () => {
                        expect(commentField).exist;
                    });

                    it('Should have a comment field as TextArea', () => {
                        expect(commentField.inputComponent).equals('text-area-input');
                    });

                    it('Should have a translatable label "Translatable#Comment"', () => {
                        expect(commentField.label).equals('Translatable#Comment');
                    });

                });
                describe('Role Field', () => {

                    let roleField: FormFieldConfiguration;

                    before(() => {
                        roleField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.ROLE_IDS);
                    });

                    it('Should have a Role Field', () => {
                        expect(roleField).exist;
                    });

                    it('Should have a translatable label "Translatable#Roles"', () => {
                        expect(roleField.label).equals('Translatable#Roles');
                    });

                    it('Should be required', () => {
                        expect(roleField.required).true;
                    });

                    it('Should have input component object-reference-input', () => {
                        expect(roleField.inputComponent).equals('object-reference-input');
                    });

                    it('Should have the correct referenced object', () => {
                        const option = roleField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).equals(KIXObjectType.ROLE);
                    });

                    it('should be a multislect input', () => {
                        const option = roleField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).true;
                    });

                    it('should have a default value', () => {
                        expect(roleField.defaultValue).exist;
                        expect(roleField.defaultValue.value).exist;
                        expect(roleField.defaultValue.value).an('array');
                        expect(roleField.defaultValue.value[0]).equals(1);
                    });

                });

                describe('Valid Field', () => {

                    let validityField: FormFieldConfiguration;

                    before(() => {
                        validityField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.VALID_ID);
                    });

                    it('Should have a validity field', () => {
                        expect(validityField).exist;
                    });

                    it('Should have a translatable label "Translatable#Validity"', () => {
                        expect(validityField.label).equals('Translatable#Validity');
                    });

                    it('Should be required', () => {
                        expect(validityField.required).true;
                    });

                    it('Should have input component object-reference-input', () => {
                        expect(validityField.inputComponent).equals('object-reference-input');
                    });

                    it('Should have the correct referenced object', () => {
                        const option = validityField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).equals(KIXObjectType.VALID_OBJECT);
                    });
                    it('should be a singleselect input', () => {
                        const option = validityField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).false;
                    });

                    it('should have a default value', () => {
                        expect(validityField.defaultValue).exist;
                        expect(validityField.defaultValue.value).exist;
                        expect(validityField.defaultValue.value).equals(1);
                    });
                });
            });

        });
        describe('Data Source Page', () => {

            it('Should have a translatable title "Translatable#Datasource"', () => {
                expect(form.pages[1].name).equals('Translatable#Datasource');
            });

            describe('Form Group', () => {

                it('Should contain 3 group with fields', () => {
                    expect(form.pages[1].groups).exist;
                    expect(form.pages[1].groups).an('array');
                    expect(form.pages[1].groups.length).equals(3);
                });

                describe('DataSource Group', () => {

                    let group: FormGroupConfiguration;

                    before(() => {
                        group = form.pages[1].groups[0];
                    });

                    it('should have the group', () => {
                        expect(group).exist;
                    });

                    it('Should contain fields', () => {
                        expect(group.formFields).exist;
                        expect(group.formFields).an('array');
                        expect(group.formFields.length).greaterThan(0);
                    });

                    describe('Datasource Field', () => {

                        let datasourceField: FormFieldConfiguration;

                        before(() => {
                            datasourceField = group.formFields.find((f) => f.property === ReportDefinitionProperty.DATASOURCE);
                        });

                        it('Should have the field', () => {
                            expect(datasourceField).exist;
                        });

                        it('Should have a translatable label "Translatable#Datasource"', () => {
                            expect(datasourceField.label).equals('Translatable#Datasource');
                        });

                        it('Should be required', () => {
                            expect(datasourceField.required).true;
                        });

                        it('Should have input component object-reference-input', () => {
                            expect(datasourceField.inputComponent).equals('object-reference-input');
                        });

                        it('Should have the correct referenced object', () => {
                            const option = datasourceField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).equals(KIXObjectType.REPORT_DATA_SOURCE);
                        });
                        it('should be a singleselect input', () => {
                            const option = datasourceField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).false;
                        });

                        it('should have a default value GenericSQL', () => {
                            expect(datasourceField.defaultValue).exist;
                            expect(datasourceField.defaultValue.value).exist;
                            expect(datasourceField.defaultValue.value).equals('GenericSQL');
                        });

                        it('should have one child field', () => {
                            expect(datasourceField.children).exist;
                            expect(datasourceField.children).an('array');
                            expect(datasourceField.children.length).equals(1);
                        });

                        describe('DBMS Field', () => {

                            let dbmsField: FormFieldConfiguration;

                            before(() => {
                                dbmsField = datasourceField.children.find((f) => f.property === 'DBMS');
                            });

                            it('Should have the field', () => {
                                expect(dbmsField).exist;
                            });

                            it('Should have a translatable label "Translatable#DBMS"', () => {
                                expect(dbmsField.label).equals('Translatable#DBMS');
                            });

                            it('Should have input component default-select-input', () => {
                                expect(dbmsField.inputComponent).equals('default-select-input');
                            });

                            it('Should be readonly', () => {
                                expect(dbmsField.readonly).true;
                            });

                            it('Should be required', () => {
                                expect(dbmsField.required).true;
                            });

                            it('Should have 3 nodes[mysql, postgressql, any]', () => {
                                const nodesOption = dbmsField.options.find((o) => o.option === DefaultSelectInputFormOption.NODES);
                                expect(nodesOption).exist;

                                const nodes: TreeNode[] = nodesOption.value;
                                expect(nodes).exist;
                                expect(nodes).an('array');
                                expect(nodes.length).equals(3);

                                expect(nodes.some((n) => n.id === 'mysql')).true;
                                expect(nodes.some((n) => n.id === 'postgresql')).true;
                                expect(nodes.some((n) => n.id === 'any')).true;
                            });

                            it('should have a default value any', () => {
                                expect(dbmsField.defaultValue).exist;
                                expect(dbmsField.defaultValue.value).exist;
                                expect(dbmsField.defaultValue.value).equals('any');
                            });

                            it('should have a one child field', () => {
                                expect(dbmsField.children).exist;
                                expect(dbmsField.children).an('array');
                                expect(dbmsField.children.length).equals(1);
                            });

                            describe('SQL Field', () => {

                                let sqlField: FormFieldConfiguration;

                                before(() => {
                                    sqlField = dbmsField.children.find((f) => f.property === 'SQL');
                                });

                                it('Should have the field', () => {
                                    expect(sqlField).exist
                                });

                                it('Should be required', () => {
                                    expect(sqlField.required).true;
                                });

                                it('Should have input component text-area-input', () => {
                                    expect(sqlField.inputComponent).equals('text-area-input');
                                });

                                it('Should have a language option for sql', () => {
                                    const languageOption = sqlField.options.find((o) => o.option === FormFieldOptions.LANGUAGE);
                                    expect(languageOption).exist;
                                    expect(languageOption.value).exist;
                                    expect(languageOption.value).equals('sql');
                                });

                            });
                        });
                    });
                });

                describe('Parameter Group', () => {
                    let group: FormGroupConfiguration;

                    before(() => {
                        group = form.pages[1].groups[2];
                    });

                    it('should have the group', () => {
                        expect(group).exist;
                    });

                    it('Should contain fields', () => {
                        expect(group.formFields).exist;
                        expect(group.formFields).an('array');
                        expect(group.formFields.length).greaterThan(0);
                    });
                    describe('Parameter Field', () => {

                        let parameterField: FormFieldConfiguration;

                        before(() => {
                            parameterField = group.formFields.find((f) => f.property === ReportDefinitionProperty.PARAMTER);
                        });

                        it('Should have the field', () => {
                            expect(parameterField).exist;
                        });

                        it('Should have a translatable label "Translatable#Parameter"', () => {
                            expect(parameterField.label).equals('Translatable#Parameter');
                        });

                        it('Should have the default input component', () => {
                            expect(parameterField.inputComponent).null;
                        });

                        it('Should have countMin = 0', () => {
                            expect(parameterField.countMin).equals(0);
                        });

                        it('Should have countDefault = 0', () => {
                            expect(parameterField.countDefault).equals(0);
                        });

                        it('Should have countMax = 50', () => {
                            expect(parameterField.countMax).equals(50);
                        });

                        it('Should have be configured empty = true', () => {
                            expect(parameterField.empty).true;
                        });

                        it('Should have be configured asStructure = true', () => {
                            expect(parameterField.asStructure).true;
                        });

                        it('Should not have children', () => {
                            expect(parameterField.children).exist;
                            expect(parameterField.children).an('array');
                            expect(parameterField.children.length).equals(0);
                        });
                    });
                })

            });
        });

        describe('Outputformats Page', () => {
            it('Should have a translatable title "Translatable#Output Format"', () => {
                expect(form.pages[2].name).equals('Translatable#Output Format');
            });

            describe('Form Group', () => {

                it('Should contain one group with fields', () => {
                    expect(form.pages[2].groups).exist;
                    expect(form.pages[2].groups).an('array');
                    expect(form.pages[2].groups.length).equals(1);
                    expect(form.pages[2].groups[0].formFields).exist;
                    expect(form.pages[2].groups[0].formFields).an('array');
                });

                describe('Title Field', () => {

                    let titleField: FormFieldConfiguration;

                    before(() => {
                        titleField = form.pages[2].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.CONFIG_TITLE);
                    });

                    it('Should have the field', () => {
                        expect(titleField).exist;
                    });

                    it('Should have a translatable label "Translatable#Title"', () => {
                        expect(titleField.label).equals('Translatable#Title');
                    });

                    it('Should not be required', () => {
                        expect(titleField.required).false;
                    });

                    it('Should have the default input component', () => {
                        expect(titleField.inputComponent).null;
                    });
                });

                describe('Output Format Field', () => {

                    let outputFormatField: FormFieldConfiguration;

                    before(() => {
                        outputFormatField = form.pages[2].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
                    });

                    it('Should have the field', () => {
                        expect(outputFormatField).exist;
                    });

                    it('Should have a translatable label "Translatable#Output Format"', () => {
                        expect(outputFormatField.label).equals('Translatable#Output Format');
                    });

                    it('Should not be required', () => {
                        expect(outputFormatField.required).false;
                    });

                    it('Should have a input component object-reference-input', () => {
                        expect(outputFormatField.inputComponent).equals('object-reference-input');
                    });

                    it('Should have the correct referenced object', () => {
                        const option = outputFormatField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).equals(KIXObjectType.REPORT_OUTPUT_FORMAT);
                    });

                    it('should be a multislect input', () => {
                        const option = outputFormatField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).false;
                    });
                });
            });
        });
    });

    describe('Create a form based on a given ReportDefinition (contains: parameter, sql)', () => {
        let form: FormConfiguration;
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

            form = new FormConfiguration('report-definition-test-form', 'report-definition-test-form', [], KIXObjectType.REPORT_DEFINITION);
            const formInstance = new FormInstance(null);
            (formInstance as any).form = form;
            await ReportDefinitionFormCreator.createFormPages(form, MockData.TicketListDefaultReportMock as ReportDefinition, formInstance);
        });

        after(() => {
            KIXObjectService.loadObjects = originalLoadObjects;
        });

        it('should contain 3 form pages', () => {
            expect(form.pages).exist;
            expect(form.pages).an('array');
            expect(form.pages.length).equals(3);
        });

        describe('Common Page', () => {

            it('Should have a translatable title "Translatable#Report Information"', () => {
                expect(form.pages[0].name).equals('Translatable#Report Information');
            });

            describe('Form Group', () => {

                it('Should contain one group with fields', () => {
                    expect(form.pages[0].groups).exist;
                    expect(form.pages[0].groups).an('array');
                    expect(form.pages[0].groups.length).equals(1);
                    expect(form.pages[0].groups[0].formFields).exist;
                    expect(form.pages[0].groups[0].formFields).an('array');
                });

                describe('Title Field', () => {

                    let titleField: FormFieldConfiguration;

                    before(() => {
                        titleField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.NAME);
                    })

                    it('Should have a title field', () => {
                        expect(titleField).exist;
                    });

                    it('Should have a translatable label "Translatable#Title"', () => {
                        expect(titleField.label).equals('Translatable#Title');
                    });

                    it('Should be required', () => {
                        expect(titleField.required).true;
                    });

                    it('Should have a default value', () => {
                        expect(titleField.defaultValue).exist;
                        expect(titleField.defaultValue.value).exist;
                        expect(titleField.defaultValue.value).equals(MockData.TicketListDefaultReportMock.Name);
                    });
                });

                describe('Comment Field', () => {
                    let commentField: FormFieldConfiguration;

                    before(() => {
                        commentField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.COMMENT);
                    });

                    it('Should have a comment field', () => {
                        expect(commentField).exist;
                    });

                    it('Should have a comment field as TextArea', () => {
                        expect(commentField.inputComponent).equals('text-area-input');
                    });

                    it('Should have a translatable label "Translatable#Comment"', () => {
                        expect(commentField.label).equals('Translatable#Comment');
                    });

                    it('Should have a default value', () => {
                        expect(commentField.defaultValue).exist;
                        expect(commentField.defaultValue.value).exist;
                        expect(commentField.defaultValue.value).equals(MockData.TicketListDefaultReportMock.Comment);
                    });

                });
                describe('Role Field', () => {

                    let roleField: FormFieldConfiguration;

                    before(() => {
                        roleField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.ROLE_IDS);
                    });

                    it('Should have a Role Field', () => {
                        expect(roleField).exist;
                    });

                    it('Should have a translatable label "Translatable#Roles"', () => {
                        expect(roleField.label).equals('Translatable#Roles');
                    });

                    it('Should be required', () => {
                        expect(roleField.required).true;
                    });

                    it('Should have input component object-reference-input', () => {
                        expect(roleField.inputComponent).equals('object-reference-input');
                    });

                    it('Should have the correct referenced object', () => {
                        const option = roleField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).equals(KIXObjectType.ROLE);
                    });

                    it('should be a multislect input', () => {
                        const option = roleField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).true;
                    });

                    it('should have not a default value', () => {
                        expect(roleField.defaultValue).exist;
                        expect(roleField.defaultValue.value).not.exist;
                    });

                });

                describe('Valid Field', () => {

                    let validityField: FormFieldConfiguration;

                    before(() => {
                        validityField = form.pages[0].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.VALID_ID);
                    });

                    it('Should have a validity field', () => {
                        expect(validityField).exist;
                    });

                    it('Should have a translatable label "Translatable#Validity"', () => {
                        expect(validityField.label).equals('Translatable#Validity');
                    });

                    it('Should be required', () => {
                        expect(validityField.required).true;
                    });

                    it('Should have input component object-reference-input', () => {
                        expect(validityField.inputComponent).equals('object-reference-input');
                    });

                    it('Should have the correct referenced object', () => {
                        const option = validityField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).equals(KIXObjectType.VALID_OBJECT);
                    });
                    it('should be a singleselect input', () => {
                        const option = validityField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).false;
                    });

                    it('should have a default value', () => {
                        expect(validityField.defaultValue).exist;
                        expect(validityField.defaultValue.value).exist;
                        expect(validityField.defaultValue.value).equals(1);
                    });
                });
            });

        });

        describe('Data Source Page', () => {

            it('Should have a translatable title "Translatable#Datasource"', () => {
                expect(form.pages[1].name).equals('Translatable#Datasource');
            });

            describe('Form Group', () => {

                it('Should contain 3 groups with fields', () => {
                    expect(form.pages[1].groups).exist;
                    expect(form.pages[1].groups).an('array');
                    expect(form.pages[1].groups.length).equals(3);
                });

                describe('DataSource Group', () => {

                    let group: FormGroupConfiguration;

                    before(() => {
                        group = form.pages[1].groups[0];
                    });

                    it('should have the group', () => {
                        expect(group).exist;
                    });

                    it('Should contain fields', () => {
                        expect(group.formFields).exist;
                        expect(group.formFields).an('array');
                        expect(group.formFields.length).greaterThan(0);
                    });
                    describe('Datasource Field', () => {

                        let datasourceField: FormFieldConfiguration;

                        before(() => {
                            datasourceField = group.formFields.find((f) => f.property === ReportDefinitionProperty.DATASOURCE);
                        });

                        it('Should have the field', () => {
                            expect(datasourceField).exist;
                        });

                        it('Should have a translatable label "Translatable#Datasource"', () => {
                            expect(datasourceField.label).equals('Translatable#Datasource');
                        });

                        it('Should be required', () => {
                            expect(datasourceField.required).true;
                        });

                        it('Should have input component object-reference-input', () => {
                            expect(datasourceField.inputComponent).equals('object-reference-input');
                        });

                        it('Should have the correct referenced object', () => {
                            const option = datasourceField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).equals(KIXObjectType.REPORT_DATA_SOURCE);
                        });

                        it('should be a singleselect input', () => {
                            const option = datasourceField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).false;
                        });

                        it('should have a default value GenericSQL', () => {
                            expect(datasourceField.defaultValue).exist;
                            expect(datasourceField.defaultValue.value).exist;
                            expect(datasourceField.defaultValue.value).equals('GenericSQL');
                        });

                        it('should have one child field', () => {
                            expect(datasourceField.children).exist;
                            expect(datasourceField.children).an('array');
                            expect(datasourceField.children.length).equals(1);
                        });

                        describe('DBMS Field', () => {

                            let dbmsField: FormFieldConfiguration;

                            before(() => {
                                dbmsField = datasourceField.children.find((f) => f.property === 'DBMS');
                            });

                            it('Should have the field', () => {
                                expect(dbmsField).exist;
                            });

                            it('Should have a translatable label "Translatable#DBMS"', () => {
                                expect(dbmsField.label).equals('Translatable#DBMS');
                            });

                            it('Should have input component default-select-input', () => {
                                expect(dbmsField.inputComponent).equals('default-select-input');
                            });

                            it('Should be readonly', () => {
                                expect(dbmsField.readonly).true;
                            });

                            it('Should be required', () => {
                                expect(dbmsField.required).true;
                            });

                            it('Should have 3 nodes[mysql, postgressql, any]', () => {
                                const nodesOption = dbmsField.options.find((o) => o.option === DefaultSelectInputFormOption.NODES);
                                expect(nodesOption).exist;

                                const nodes: TreeNode[] = nodesOption.value;
                                expect(nodes).exist;
                                expect(nodes).an('array');
                                expect(nodes.length).equals(3);

                                expect(nodes.some((n) => n.id === 'mysql')).true;
                                expect(nodes.some((n) => n.id === 'postgresql')).true;
                                expect(nodes.some((n) => n.id === 'any')).true;
                            });

                            it('should have a default value any', () => {
                                expect(dbmsField.defaultValue).exist;
                                expect(dbmsField.defaultValue.value).exist;
                                expect(dbmsField.defaultValue.value).equals('any');
                            });

                            it('should have a one child field', () => {
                                expect(dbmsField.children).exist;
                                expect(dbmsField.children).an('array');
                                expect(dbmsField.children.length).equals(1);
                            });

                            describe('SQL Field', () => {

                                let sqlField: FormFieldConfiguration;

                                before(() => {
                                    sqlField = dbmsField.children.find((f) => f.property === 'SQL');
                                });

                                it('Should have the field', () => {
                                    expect(sqlField).exist
                                });

                                it('Should be required', () => {
                                    expect(sqlField.required).true;
                                });

                                it('Should have input component text-area-input', () => {
                                    expect(sqlField.inputComponent).equals('text-area-input');
                                });

                                it('Should have a language option for sql', () => {
                                    const languageOption = sqlField.options.find((o) => o.option === FormFieldOptions.LANGUAGE);
                                    expect(languageOption).exist;
                                    expect(languageOption.value).exist;
                                    expect(languageOption.value).equals('sql');
                                });

                                it('Should have a default value for sql', () => {
                                    expect(sqlField.defaultValue).exist;
                                    expect(sqlField.defaultValue.value).exist;

                                    const base64SQL = Buffer.from(sqlField.defaultValue.value, 'binary').toString('base64');
                                    const value = `base64(${base64SQL})`;
                                    expect(value).equals(MockData.TicketListDefaultReportMock.Config.DataSource.SQL.any);
                                });

                            });
                        });
                    });
                });

                describe('Parameters Group', () => {
                    let group: FormGroupConfiguration;

                    before(() => {
                        group = form.pages[1].groups[2];
                    });

                    it('should have the group', () => {
                        expect(group).exist;
                    });

                    it('Should contain fields', () => {
                        expect(group.formFields).exist;
                        expect(group.formFields).an('array');
                        expect(group.formFields.length).greaterThan(0);
                    });
                    describe('Parameter Fields', () => {

                        let parameterFields: FormFieldConfiguration[];

                        before(() => {
                            parameterFields = group.formFields.filter((f) => f.property === ReportDefinitionProperty.PARAMTER);
                        });

                        it('Should contain 4 parameter fields', () => {
                            expect(parameterFields).exist;
                            expect(parameterFields).an('array');
                            expect(parameterFields.length).equals(4);
                        });

                        describe("Parameter Field - FromDate", () => {

                            let parameterField: FormFieldConfiguration;

                            before(() => {
                                parameterField = parameterFields.find((f) => f.id === 'DateFrom');
                            });

                            it('Should have correct configuration', () => {
                                testParameterField(parameterField, 'From');
                            });

                        });

                        describe("Parameter Field - ToDate", () => {

                            let parameterField: FormFieldConfiguration;

                            before(() => {
                                parameterField = parameterFields.find((f) => f.id === 'ToDate');
                            });

                            it('Should have correct configuration', () => {
                                testParameterField(parameterField, 'To');
                            });

                        });

                        describe("Parameter Field - TypeIDList", () => {

                            let parameterField: FormFieldConfiguration;

                            before(() => {
                                parameterField = parameterFields.find((f) => f.id === 'TypeIDList');
                            });

                            it('Should have correct configuration', () => {
                                testParameterField(parameterField, 'Ticket Type');
                            });

                        });

                        describe("Parameter Field - OrganisationIDList", () => {

                            let parameterField: FormFieldConfiguration;

                            before(() => {
                                parameterField = parameterFields.find((f) => f.id === 'OrganisationIDList');
                            });

                            it('Should have correct configuration', () => {
                                testParameterField(parameterField, 'Organisation');
                            });

                        });
                    });
                });

            });
        });

        describe('Outputformats Page', () => {
            it('Should have a translatable title "Translatable#Output Format"', () => {
                expect(form.pages[2].name).equals('Translatable#Output Format');
            });

            describe('Form Group', () => {

                it('Should contain one group with fields', () => {
                    expect(form.pages[2].groups).exist;
                    expect(form.pages[2].groups).an('array');
                    expect(form.pages[2].groups.length).equals(1);
                    expect(form.pages[2].groups[0].formFields).exist;
                    expect(form.pages[2].groups[0].formFields).an('array');
                });

                describe('Title Field', () => {

                    let titleField: FormFieldConfiguration;

                    before(() => {
                        titleField = form.pages[2].groups[0].formFields.find((f) => f.property === ReportDefinitionProperty.CONFIG_TITLE);
                    });

                    it('Should have the field', () => {
                        expect(titleField).exist;
                    });

                    it('Should have a translatable label "Translatable#Title"', () => {
                        expect(titleField.label).equals('Translatable#Title');
                    });

                    it('Should not be required', () => {
                        expect(titleField.required).false;
                    });

                    it('Should have the default input component', () => {
                        expect(titleField.inputComponent).null;
                    });
                });

                describe('Output Format Fields', () => {

                    let outputFormatFields: FormFieldConfiguration[];

                    before(() => {
                        outputFormatFields = form.pages[2].groups[0].formFields.filter((f) => f.property === ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
                    });

                    it('should hav 2 output format fields', () => {
                        expect(outputFormatFields.length).equals(2);
                    });

                    describe("Should have CSV output format field", () => {

                        let csvFormatField: FormFieldConfiguration;

                        before(() => {
                            csvFormatField = outputFormatFields[0];
                        });

                        it('Should have the field', () => {
                            expect(csvFormatField).exist;
                        });

                        it('Should have a translatable label "Translatable#Output Format"', () => {
                            expect(csvFormatField.label).equals('Translatable#Output Format');
                        });

                        it('Should not be required', () => {
                            expect(csvFormatField.required).false;
                        });

                        it('Should have a input component object-reference-input', () => {
                            expect(csvFormatField.inputComponent).equals('object-reference-input');
                        });

                        it('Should have the correct referenced object', () => {
                            const option = csvFormatField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).equals(KIXObjectType.REPORT_OUTPUT_FORMAT);
                        });

                        it('should be a singleselect input', () => {
                            const option = csvFormatField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).false;
                        });

                        it('should have a default value', () => {
                            expect(csvFormatField.defaultValue).exist;
                            expect(csvFormatField.defaultValue.value).exist;
                            expect(csvFormatField.defaultValue.value).equals('CSV');
                        });

                        describe("Check Output Format Config", () => {

                            it('should have 5 children for csv config', () => {
                                expect(csvFormatField.children).exist;
                                expect(csvFormatField.children).an('array');
                                expect(csvFormatField.children.length).equals(5);
                            });

                            describe('Title field', () => {
                                let titleField: FormFieldConfiguration;

                                before(() => {
                                    titleField = csvFormatField.children.find((f) => f.property === 'Title');
                                });

                                it('should have field', () => {
                                    expect(titleField).exist;
                                });

                                it('should have default input component', () => {
                                    expect(titleField.inputComponent).null;
                                });

                                it('should not have default value', () => {
                                    expect(titleField.defaultValue).exist;
                                    expect(titleField.defaultValue.value).not.exist;
                                });
                            });

                            describe('Inlcude column header field', () => {
                                let includeField: FormFieldConfiguration;

                                before(() => {
                                    includeField = csvFormatField.children.find((f) => f.property === 'IncludeColumnHeader');
                                });

                                it('should have field', () => {
                                    expect(includeField).exist;
                                });

                                it('should have checkbox input component', () => {
                                    expect(includeField.inputComponent).equals('checkbox-input');
                                });

                                it('should have default value', () => {
                                    expect(includeField.defaultValue).exist;
                                    expect(includeField.defaultValue.value).exist;
                                    expect(includeField.defaultValue.value).equals(1);
                                });
                            });

                            describe('Quote field', () => {
                                let quoteField: FormFieldConfiguration;

                                before(() => {
                                    quoteField = csvFormatField.children.find((f) => f.property === 'Quote');
                                });

                                it('should have field', () => {
                                    expect(quoteField).exist;
                                });

                                it('should have default input component', () => {
                                    expect(quoteField.inputComponent).null;
                                });

                                it('should have default value', () => {
                                    expect(quoteField.defaultValue).exist;
                                    expect(quoteField.defaultValue.value).exist;
                                    expect(quoteField.defaultValue.value).equals('\"');
                                });
                            });

                            describe('Separator field', () => {
                                let separatorField: FormFieldConfiguration;

                                before(() => {
                                    separatorField = csvFormatField.children.find((f) => f.property === 'Separator');
                                });

                                it('should have field', () => {
                                    expect(separatorField).exist;
                                });

                                it('should have default input component', () => {
                                    expect(separatorField.inputComponent).null;
                                });

                                it('should have default value', () => {
                                    expect(separatorField.defaultValue).exist;
                                    expect(separatorField.defaultValue.value).exist;
                                    expect(separatorField.defaultValue.value).equals('\,');
                                });
                            });

                            describe('Columns field', () => {
                                let columnsField: FormFieldConfiguration;

                                before(() => {
                                    columnsField = csvFormatField.children.find((f) => f.property === 'Columns');
                                });

                                it('should have field', () => {
                                    expect(columnsField).exist;
                                });

                                it('should have default input component', () => {
                                    expect(columnsField.inputComponent).null;
                                });

                                it('should not have default value', () => {
                                    expect(columnsField.defaultValue).exist;
                                    expect(columnsField.defaultValue.value).not.exist;
                                });
                            });
                        });
                    });

                    describe("Should have JSON output format field", () => {

                        let jsonFormatField: FormFieldConfiguration;

                        before(() => {
                            jsonFormatField = outputFormatFields[1];
                        });

                        it('Should have the field', () => {
                            expect(jsonFormatField).exist;
                        });

                        it('Should have a translatable label "Translatable#Output Format"', () => {
                            expect(jsonFormatField.label).equals('Translatable#Output Format');
                        });

                        it('Should not be required', () => {
                            expect(jsonFormatField.required).false;
                        });

                        it('Should have a input component object-reference-input', () => {
                            expect(jsonFormatField.inputComponent).equals('object-reference-input');
                        });

                        it('Should have the correct referenced object', () => {
                            const option = jsonFormatField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).equals(KIXObjectType.REPORT_OUTPUT_FORMAT);
                        });

                        it('should be a singleselect input', () => {
                            const option = jsonFormatField.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                            expect(option).exist;
                            expect(option.value).exist;
                            expect(option.value).false;
                        });

                        it('should have a default value', () => {
                            expect(jsonFormatField.defaultValue).exist;
                            expect(jsonFormatField.defaultValue.value).exist;
                            expect(jsonFormatField.defaultValue.value).equals('JSON');
                        });

                        describe("Check Output Format Config", () => {

                            it('should have 5 children for csv config', () => {
                                expect(jsonFormatField.children).exist;
                                expect(jsonFormatField.children).an('array');
                                expect(jsonFormatField.children.length).equals(1);
                            });

                            describe('Title field', () => {
                                let titleField: FormFieldConfiguration;

                                before(() => {
                                    titleField = jsonFormatField.children.find((f) => f.property === 'Title');
                                });

                                it('should have title field', () => {
                                    expect(titleField).exist;
                                });

                                it('should have default input component', () => {
                                    expect(titleField.inputComponent).null;
                                });

                                it('should have default value', () => {
                                    expect(titleField.defaultValue).exist;
                                    expect(titleField.defaultValue.value).exist;
                                    expect(titleField.defaultValue.value).equals('JSON Title');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

function testParameterField(parameterField: FormFieldConfiguration, title: string): void {
    it('Should have the field', () => {
        expect(parameterField).exist;
    });

    it('Should have a translatable label', () => {
        expect(parameterField.label).equals(title);
    });

    it('Should have the default input component', () => {
        expect(parameterField.inputComponent).null;
    });

    it('Should have countMin = 0', () => {
        expect(parameterField.countMin).equals(0);
    });

    it('Should have countDefault = 0', () => {
        expect(parameterField.countDefault).equals(0);
    });

    it('Should have countMax = 50', () => {
        expect(parameterField.countMax).equals(50);
    });

    it('Should have be configured empty = false', () => {
        expect(parameterField.empty).false;
    });

    it('Should have be configured asStructure = true', () => {
        expect(parameterField.asStructure).true;
    });

    it('Should not have children', () => {
        expect(parameterField.children).exist;
        expect(parameterField.children).an('array');
        expect(parameterField.children.length).equals(10);
    });

    it('Should have correct child fields', () => {
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.NAME)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.DESCRIPTION)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.LABEL)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.DEFAULT)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.POSSIBLE_VALUES)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.MULTIPLE)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.REQUIRED)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.READ_ONLY)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.REFERENCES)).true;
        expect(parameterField.children.some((f) => f.property === ReportParameterProperty.DATA_TYPE)).true;
    });
}