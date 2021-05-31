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
import { FormConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/FormConfiguration';
import { FormGroupConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/FormGroupConfiguration';
import { FormContext } from '../../src/frontend-applications/agent-portal/model/configuration/FormContext';
import { FormPageConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/FormPageConfiguration';
import { FormFieldConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/FormFieldConfiguration';
import { FormFactory } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/FormFactory';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('FormFactory', () => {

    let form: FormConfiguration;

    before(() => {
        form = createFormMock();
        FormFactory.initForm(form);
    });

    describe('Check pages', () => {

        it('Should have a page', () => {
            expect(form.pages).exist;
            expect(form.pages).an('array');
            expect(form.pages.length).equals(1);
        });

        describe('Check groups', () => {

            it('Page should have a groups', () => {
                expect(form.pages[0].groups).exist;
                expect(form.pages[0].groups).an('array');
                expect(form.pages[0].groups.length).equals(1);
            });

            describe('Check fields', () => {

                it('Should have 4 fields', () => {
                    expect(form.pages[0].groups[0].formFields).exist;
                    expect(form.pages[0].groups[0].formFields).an('array');
                    expect(form.pages[0].groups[0].formFields.length).equals(4);
                });

                describe('Check Testfield1', () => {
                    let field: FormFieldConfiguration;

                    before(() => {
                        field = form.pages[0].groups[0].formFields.find((f) => f.id === 'test-form-field1');
                    })

                    it('Should have the field', () => {
                        expect(field).exist;
                    });

                    it('Should have an instanceId', () => {
                        expect(field.instanceId).exist;
                    });

                    it('Should have an options array', () => {
                        expect(field.options).exist;
                        expect(field.options).an('array');
                    });

                    it('Should have an children array', () => {
                        expect(field.children).exist;
                        expect(field.children).an('array');
                    });
                });

                describe('Check Testfield2', () => {
                    let field: FormFieldConfiguration;

                    before(() => {
                        field = form.pages[0].groups[0].formFields.find((f) => f.id === 'test-form-field2');
                    })

                    it('Should have the field', () => {
                        expect(field).exist;
                    });

                    it('Should have an instanceId', () => {
                        expect(field.instanceId).exist;
                    });

                    it('Should have an options array', () => {
                        expect(field.options).exist;
                        expect(field.options).an('array');
                    });

                    it('Should have an children array', () => {
                        expect(field.children).exist;
                        expect(field.children).an('array');
                    });
                });

                describe('Check Testfield3', () => {
                    let field: FormFieldConfiguration;

                    before(() => {
                        field = form.pages[0].groups[0].formFields.find((f) => f.id === 'test-form-field3');
                    })

                    it('Should have the field', () => {
                        expect(field).exist;
                    });

                    it('Should have an instanceId', () => {
                        expect(field.instanceId).exist;
                    });

                    it('Should have an options array', () => {
                        expect(field.options).exist;
                        expect(field.options).an('array');
                    });

                    it('Should have an children array', () => {
                        expect(field.children).exist;
                        expect(field.children).an('array');
                    });
                });

                describe('Check Testfield4', () => {
                    let field: FormFieldConfiguration;

                    before(() => {
                        field = form.pages[0].groups[0].formFields.find((f) => f.id === 'test-form-field4');
                    })

                    it('Should have the field', () => {
                        expect(field).exist;
                    });

                    it('Should have an instanceId', () => {
                        expect(field.instanceId).exist;
                    });

                    it('Should have an options array', () => {
                        expect(field.options).exist;
                        expect(field.options).an('array');
                    });

                    it('Should have an children array', () => {
                        expect(field.children).exist;
                        expect(field.children).an('array');
                    });
                });

            });
        });
    })
});

function createFormMock(): FormConfiguration {
    const testField1 = new FormFieldConfiguration('test-form-field1', 'test-form-field1', 'TestProperty1', null);
    const testField2 = new FormFieldConfiguration('test-form-field2', 'test-form-field2', 'TestProperty2', null);

    const testField3 = new FormFieldConfiguration('test-form-field3', 'test-form-field3', 'TestProperty3', null);
    testField3.options = null;

    const testField4 = new FormFieldConfiguration('test-form-field4', 'test-form-field4', 'TestProperty4', null);
    testField4.children = null;

    return new FormConfiguration(
        'test-form', 'test-form', [], '', false, FormContext.NEW, null,
        [
            new FormPageConfiguration(
                'test-form-page', 'test-form-page', [], true, true,
                [
                    new FormGroupConfiguration(
                        'test-form-group', 'test-form-group', [], '',
                        [
                            testField1, testField2, testField3, testField4
                        ]
                    )
                ]
            )
        ]
    );
}