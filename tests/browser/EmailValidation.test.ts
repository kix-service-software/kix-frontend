/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormValidationService } from '../../src/core/browser/form/validation';
import addrparser = require('address-rfc2822');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('EmailValidation', () => {

    describe('Validate email addresses with FormValidationService.', () => {

        it('Should check email addresses correctly.', () => {
            const validEmails = [
                'foo@bar.com', 'foo <foo@bar.com>', 'foo bar <foo@bar.com>',
                "'foo' <foo@bar.com>", '"foo" <foo@bar.com>', '#foo# <foo@bar.com>',
                'test.foo@bar.com', '"test..foo"@bar.com', 'f@bar.com',
                'test-foo@bar.com', 'test+foo@bar.com', 'test#foo@bar.com',
                '"test via foo" <foo@bar.com>'
            ];
            validEmails.forEach((email) => {
                expect(
                    FormValidationService.getInstance().isValidEmail(email),
                    'should be a valid mail'
                ).is.true;
            });

            expect(
                FormValidationService.getInstance().isValidEmail(''),
                'empty string should not be a valid email'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('test'),
                'simple string should not be a valid email'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('<foo> <foo@bar.com>'),
                'email with < and > for phrase should be invalid'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('foo foo@bar.com'),
                'email without < and > for address should be invalid'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('test <foo> <foo@bar.com>'),
                'email with unusual syntax should be invalid'
            ).is.false;
        });
    });

});

