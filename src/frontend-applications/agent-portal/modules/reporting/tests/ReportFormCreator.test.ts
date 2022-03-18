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
import { DefaultSelectInputFormOption } from '../../../model/configuration/DefaultSelectInputFormOption';
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { FormGroupConfiguration } from '../../../model/configuration/FormGroupConfiguration';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ObjectReferenceOptions } from '../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../base-components/webapp/core/tree';
import { ReportDefinition } from '../model/ReportDefinition';
import { ReportDefinitionProperty } from '../model/ReportDefinitionProperty';
import { ReportFormCreator } from '../webapp/core/form/ReportFormCreator';
import { MockData } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Report Form Creator', () => {

    describe('Create a Report form with ReportDefinitionMock', () => {

        let form: FormConfiguration;

        before(async () => {
            form = new FormConfiguration('', '', [], KIXObjectType.REPORT, false, FormContext.NEW);
            await ReportFormCreator.createFormPages(form, MockData.ReportDefinitionMock as ReportDefinition);
        });

        describe('Check form page', () => {

            it('Form should have one page', () => {
                expect(form.pages).exist;
                expect(form.pages).an('array');
                expect(form.pages.length).equals(1);
            });

            it('Page should have one group', () => {
                expect(form.pages[0].groups).exist;
                expect(form.pages[0].groups).an('array');
                expect(form.pages[0].groups.length).equals(1);
            });

            describe('Check form page group', () => {

                let group: FormGroupConfiguration;

                before(() => {
                    group = form.pages[0].groups[0];
                });

                it('Group should contain the correct field count', () => {
                    expect(group.formFields).exist;
                    expect(group.formFields).an('array');
                    expect(group.formFields.length).equals(MockData.ReportDefinitionMock.Config.Parameters.length + 1);
                });

                describe('Check output format field', () => {

                    let field: FormFieldConfiguration;

                    before(() => {
                        field = group.formFields.find((f) => f.property === ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
                    });

                    it('should have the field', () => {
                        expect(field).exist;
                    });

                    it('Should have input component object-reference-input', () => {
                        expect(field.inputComponent).equals('default-select-input');
                    });

                    it('Should provide available the output formats for the report definition', () => {
                        const option = field.options.find((o) => o.option === DefaultSelectInputFormOption.NODES);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).an('array');
                        expect(option.value.length).equals(2);
                        expect(option.value.some((v) => v.id === 'CSV')).true;
                        expect(option.value.some((v) => v.id === 'JSON')).true;
                    });

                    it('should be a multislect input', () => {
                        const option = field.options.find((o) => o.option === DefaultSelectInputFormOption.MULTI);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).true;
                    });

                });

                describe('Check MockParameter field', () => {

                    let field: FormFieldConfiguration;

                    before(() => {
                        field = group.formFields.find((f) => f.id === 'MockParameter');
                    });

                    it('should have the field', () => {
                        expect(field).exist;
                    });

                    it('should be required', () => {
                        expect(field.required).true;
                    });

                    it('should be readonly', () => {
                        expect(field.readonly).true;
                    });

                    it('Should have input component default-select-input', () => {
                        expect(field.inputComponent).equals('default-select-input');
                    });

                    it('Should have the correct possible values', () => {
                        const option = field.options.find((o) => o.option === DefaultSelectInputFormOption.NODES);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).an('array');
                        expect(option.value.length).equals(4);
                        expect(option.value.some((v: TreeNode) => v.id === 'a')).true;
                        expect(option.value.some((v: TreeNode) => v.id === 'b')).true;
                        expect(option.value.some((v: TreeNode) => v.id === 'c')).true;
                        expect(option.value.some((v: TreeNode) => v.id === 'd')).true;
                    });

                    it('should be a multislect input', () => {
                        const option = field.options.find((o) => o.option === DefaultSelectInputFormOption.MULTI);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).true;
                    });

                    it('should have the correct default value', () => {
                        expect(field.defaultValue).exist;
                        expect(field.defaultValue.value).exist;
                        expect(field.defaultValue.value).an('array');
                        expect(field.defaultValue.value.length).equals(2);
                        expect(field.defaultValue.value.some((v) => v === 'b')).true;
                        expect(field.defaultValue.value.some((v) => v === 'c')).true;
                    });

                });

                describe('Check MockReferenceParameter field', () => {

                    let field: FormFieldConfiguration;

                    before(() => {
                        field = group.formFields.find((f) => f.id === 'MockReferenceParameter');
                    });

                    it('should have the field', () => {
                        expect(field).exist;
                    });

                    it('Should be required', () => {
                        expect(field.required).true;
                    })

                    it('Should have input component object-reference-input', () => {
                        expect(field.inputComponent).equals('object-reference-input');
                    });

                    it('should be a multislect input', () => {
                        const option = field.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).false;
                    });

                    it('Should have the correct possible values', () => {
                        const option = field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
                        expect(option).exist;
                        expect(option.value).exist;
                        expect(option.value).an('array');
                        expect(option.value.length).equals(3);
                        expect(option.value.some((v) => v === 10)).true;
                        expect(option.value.some((v) => v === 12)).true;
                        expect(option.value.some((v) => v === 13)).true;
                    });

                    it('should have the correct default value', () => {
                        expect(field.defaultValue).exist;
                        expect(field.defaultValue.value).exist;
                        expect(field.defaultValue.value).equals(12);
                    });

                });
            });
        });
    });
});