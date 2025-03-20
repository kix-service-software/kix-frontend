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
import { FormFieldConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../src/frontend-applications/agent-portal/model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../src/frontend-applications/agent-portal/model/configuration/FormFieldOptions';
import { FormFieldValue } from '../../src/frontend-applications/agent-portal/model/configuration/FormFieldValue';
import { Context } from '../../src/frontend-applications/agent-portal/model/Context';
import { ContextFormManager } from '../../src/frontend-applications/agent-portal/model/ContextFormManager';
import { ContextService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ContextService';
import { FormInstance } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/FormInstance';
import { JSONFormFieldValidator } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/JSONFormFieldValidator';
import { ValidationResult } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ValidationSeverity';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('JSONFormFieldValidator', () => {

    let validator: JSONFormFieldValidator;

    before(() => {
        validator = new JSONFormFieldValidator();
    });

    describe('Check isValidatorFor', () => {

        const formField1 = new FormFieldConfiguration('', '', '', null);
        formField1.options = [
            new FormFieldOption(FormFieldOptions.IS_JSON, true)
        ];

        const formField2 = new FormFieldConfiguration('', '', '', null);
        formField2.options = [
            new FormFieldOption(FormFieldOptions.IS_JSON, false)
        ];

        const formField3 = new FormFieldConfiguration('', '', '', null);

        it('should be true if the option IS_JSON is true', () => {
            const isValidator = validator.isValidatorFor(formField1);
            expect(isValidator).true;
        });

        it('should be false if the option IS_JSON is false', () => {
            const isValidator = validator.isValidatorFor(formField2);
            expect(isValidator).false;
        });

        it('should be false if the option IS_JSON is not available', () => {
            const isValidator = validator.isValidatorFor(formField3);
            expect(isValidator).false;
        });

    });

    describe('Check IsValidJSONString', () => {

        const validJSON = JSON.stringify({
            property: 'value',
            array: [
                'value', 'value', 'value'
            ],
            object: {
                subproperty: 1
            },
            boolean: true
        });

        it('Should be true if JSON string is valid', () => {
            const isValid = (validator as any).IsValidJSONString(validJSON);
            expect(isValid).true;
        });

        it('Should be false if JSON string is invalid', () => {
            const isValid = (validator as any).IsValidJSONString('{dldld');
            expect(isValid).false;
        });

        it('Should be true if JSON string is a plain string', () => {
            const isValid = (validator as any).IsValidJSONString('Testvalue');
            expect(isValid).true;
        });

        it('Should be true if JSON string is a empty array', () => {
            const isValid = (validator as any).IsValidJSONString('[]');
            expect(isValid).true;
        });

        it('Should be true if JSON string is a empty object', () => {
            const isValid = (validator as any).IsValidJSONString('{}');
            expect(isValid).true;
        });

    });

    describe('Check isValidatorForDF', () => {

        it('should always return false', () => {
            expect(validator.isValidatorForDF(null)).false;
        });

    });

    describe('Check validateDF', () => {

        it('should always return OK ValidationResult', async () => {
            const result = await validator.validateDF(null, null);
            expect(result).exist;
            expect(result.severity).equals(ValidationSeverity.OK);
        });

    });

    describe('Check validate', () => {
        let originalFunction: <T extends Context>() => T;
        let validJSON = true;

        before(() => {
            originalFunction = ContextService.getInstance().getActiveContext;
            ContextService.getInstance().getActiveContext = <T extends Context>(): T => {
                return new TestContext(validJSON) as any;
            }
        });

        after(() => {
            ContextService.getInstance().getActiveContext = originalFunction;
        });

        describe('Validate valid JSON', () => {

            let result: ValidationResult;

            before(async () => {
                result = await validator.validate(null, null);
            });

            it('should be a result with severity OK', () => {
                expect(result.severity).equals(ValidationSeverity.OK);
            });

            it('Should not have a validation message', () => {
                expect(result.message).equals('');
            });
        });

        describe('Validate invalid JSON', () => {

            let result: ValidationResult;

            before(async () => {
                validJSON = false;
                result = await validator.validate(null, null);
            });

            it('should be a result with severity ERROR', () => {
                expect(result.severity).equals(ValidationSeverity.ERROR);
            });

            it('Should have a validation message', () => {
                expect(result.message).not.empty;
            });
        });

    });

});

class TestContext extends Context {

    public constructor(validJSON: boolean) {
        super(null, null, null, null, new TestFormManager(validJSON));
    }

}

class TestFormManager extends ContextFormManager {

    public constructor(
        public validJSON: boolean
    ) {
        super();
    }

    public async getFormInstance(createNewInstance?: boolean, silent?: boolean): Promise<FormInstance> {
        return new TestFormInstance(this.validJSON);
    }

}

class TestFormInstance extends FormInstance {

    public constructor(
        public validJSON: boolean
    ) {
        super(null);
    }

    public getFormFieldValue<T>(formFieldInstanceId: string): FormFieldValue<T> {
        let value = JSON.stringify({
            property: 'value',
            array: [
                'value', 'value', 'value'
            ],
            object: {
                subproperty: 1
            },
            boolean: true
        });

        if (!this.validJSON) {
            value = '{sjsndjsndjsd';
        }

        return new FormFieldValue(value) as any;
    }

}