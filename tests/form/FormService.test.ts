/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { FormFieldValueHandler } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/FormFieldValueHandler';
import { FormService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/FormService';
import { KIXModulesSocketClient } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/KIXModulesSocketClient';

chai.use(chaiAsPromised);
const expect = chai.expect;


class TestHandler extends FormFieldValueHandler {

    public constructor(
        public id: string,
        public objectType: string
    ) {
        super();
    }

}

describe('FormService', () => {

    describe('FormFieldValueHandler', () => {

        describe('Register a single FormFieldValueHandler', () => {
            let handler = new TestHandler('TestHandler', 'TestObjectType');

            before(() => {
                FormService.getInstance().addFormFieldValueHandler(handler);
            });

            after(() => {
                cleanupFormService();
            })

            describe('Retrieve the handler', () => {
                let handler: FormFieldValueHandler[];

                before(() => {
                    handler = FormService.getInstance().getFormFieldValueHandler('TestObjectType');
                });

                it('Should return a array of handler for objectType', () => {
                    expect(handler).exist;
                    expect(handler).an('array');
                });

                it('Should contain 1 handler', () => {
                    expect(handler.length).equals(1);
                });

                it('Should contain the correct handler', () => {
                    expect(handler[0].id).equals('TestHandler');
                });
            });

        });

        describe('Register a single FormFieldValueHandler', () => {
            let handler1 = new TestHandler('TestHandler1', 'TestObjectType1');
            let handler2 = new TestHandler('TestHandler2', 'TestObjectType1');
            let handler3 = new TestHandler('TestHandler3', 'TestObjectType2');
            let handler4 = new TestHandler('TestHandler4', 'TestObjectType3');

            before(() => {
                FormService.getInstance().addFormFieldValueHandler(handler1);
                FormService.getInstance().addFormFieldValueHandler(handler2);
                FormService.getInstance().addFormFieldValueHandler(handler3);
                FormService.getInstance().addFormFieldValueHandler(handler4);
            });

            after(() => {
                cleanupFormService();
            })

            describe('Retrieve the handler for object type TestObjectType1', () => {
                let handler: FormFieldValueHandler[];

                before(() => {
                    handler = FormService.getInstance().getFormFieldValueHandler('TestObjectType1');
                });

                it('Should return a array of handler', () => {
                    expect(handler).exist;
                    expect(handler).an('array');
                });

                it('Should contain 2 handler', () => {
                    expect(handler.length).equals(2);
                });

                it('Should contain the correct handler', () => {
                    expect(handler.some((h) => h.id === 'TestHandler1')).true;
                    expect(handler.some((h) => h.id === 'TestHandler2')).true;
                });
            });

            describe('Retrieve the handler for object type TestObjectType2', () => {
                let handler: FormFieldValueHandler[];

                before(() => {
                    handler = FormService.getInstance().getFormFieldValueHandler('TestObjectType2');
                });

                it('Should return a array of handler', () => {
                    expect(handler).exist;
                    expect(handler).an('array');
                });

                it('Should contain 1 handler', () => {
                    expect(handler.length).equals(1);
                });

                it('Should contain the correct handler', () => {
                    expect(handler.some((h) => h.id === 'TestHandler3')).true;
                });
            });
        });
    });

    describe('Add forms', () => {

        describe('add a new form to the service', () => {
            let form = new FormConfiguration('test-form', 'test-form', [], 'TestObjectType');

            before(() => {
                FormService.getInstance().addForm(form);
            });

            after(() => {
                cleanupFormService();
            });

            it('should retrieve the form', async () => {
                const formToCheck = await FormService.getInstance().getForm('test-form');
                expect(formToCheck).exist;
                expect(formToCheck.id).equals(form.id);
            });

        });

        describe('overwrite an existing form in the service', () => {
            let form1 = new FormConfiguration('test-form', 'test-form1', [], 'TestObjectType');
            let form2 = new FormConfiguration('test-form', 'test-form2', [], 'TestObjectType');

            before(() => {
                FormService.getInstance().addForm(form1);
                FormService.getInstance().addForm(form2);
            });

            after(() => {
                cleanupFormService();
            });

            describe('check the form', () => {
                let formToCheck: FormConfiguration;

                before(async () => {
                    formToCheck = await FormService.getInstance().getForm('test-form');
                });

                it('should retrieve the overwritten form', async () => {
                    expect(formToCheck).exist;
                    expect(formToCheck.id).equals(form1.id);
                });

                it('should have the correct name', () => {
                    expect(formToCheck.name).equals(form2.name);
                });
            });


        });

        describe('load the form if not exists', () => {
            let originalFunction;
            let form = new FormConfiguration('test-form', 'test-form', [], 'TestObjectType');

            before(() => {
                originalFunction = KIXModulesSocketClient.getInstance().loadFormConfiguration;
                KIXModulesSocketClient.getInstance().loadFormConfiguration =
                    async (formId: string): Promise<FormConfiguration> => {
                        return form;
                    };
            });

            after(() => {
                KIXModulesSocketClient.getInstance().loadFormConfiguration = originalFunction;
                cleanupFormService();
            });

            it('should retrieve the form', async () => {
                const formToCheck = await FormService.getInstance().getForm('test-form');
                expect(formToCheck).exist;
                expect(formToCheck.id).equals(form.id);
            });
        });
    });
});

function cleanupFormService(): void {
    (FormService.getInstance() as any).formFieldValueHandler = new Map();
    (FormService.getInstance() as any).forms = [];
}