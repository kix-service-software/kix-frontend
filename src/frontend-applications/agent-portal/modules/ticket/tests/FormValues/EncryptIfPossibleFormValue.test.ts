/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TestObjectValueMapper } from '../../../object-forms/tests/MockData';
import { EncryptIfPossibleFormValue } from '../../webapp/core/form/form-values/EncryptIfPossibleFormValue';
import { Article } from '../../model/Article';
import { ArticleProperty } from '../../model/ArticleProperty';
import { FormContext } from '../../../../model/configuration/FormContext';
import { Ticket } from '../../model/Ticket';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('EncryptIfPossibleFormValue', () => {

    describe('Init form value', () => {

        let formValue: EncryptIfPossibleFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const article = new Article();

            formValue = new EncryptIfPossibleFormValue(ArticleProperty.ENCRYPT_IF_POSSIBLE, article, objectFormValueMapper, null);

            await formValue.initFormValue();
        });

        it('value should be disabled', () => {
            // no recipient is set, encription not possible
            expect(formValue.enabled).false;
        });

        it('relevant properties should be set', () => {
            expect(formValue['relevantArticleEmailProperties']).an('array');
            expect(formValue['relevantArticleEmailProperties'].length).equals(3);
            expect(formValue['relevantArticleEmailProperties']).to.include(ArticleProperty.TO);
            expect(formValue['relevantArticleEmailProperties']).to.include(ArticleProperty.CC);
            expect(formValue['relevantArticleEmailProperties']).to.include(ArticleProperty.BCC);
        });

    });

    describe('Check enable state on object changes in EDIT dialog', () => {

        let formValue: EncryptIfPossibleFormValue;
        let article: Article;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            objectFormValueMapper.formContext = FormContext.EDIT;
            article = new Article();
            article.ChannelID = 2;
            const ticket = new Ticket();
            article.ticket = ticket;

            formValue = new EncryptIfPossibleFormValue(ArticleProperty.ENCRYPT_IF_POSSIBLE, article, objectFormValueMapper, null);

            await formValue.initFormValue();
        });

        afterEach(() => {
            article.To = null;
            article.Cc = null;
            article.Bcc = null;
            article.ChannelID = 2;
            article.ticket.ContactID = null;
        });

        // value should only be enabled if just one recipient is set and channel is email, contact field should NOT count
        it('set one recipient', async () => {
            article.To = 'first@contact.com';
            expect(formValue.enabled).true;
        });

        it('set one recipient but note', async () => {
            article.To = 'first@contact.com';
            expect(formValue.enabled).true;
            article.ChannelID = 1;
            expect(formValue.enabled).false;
        });

        it('set two recipient', async () => {
            article.To = 'first@contact.com,second@contact.com';
            expect(formValue.enabled).false;
        });

        it('set two recipient (two properties)', async () => {
            article.To = 'first@contact.com';
            article.Cc = 'second@contact.com';
            expect(formValue.enabled).false;
        });

        it('set one recipient (other properties)', async () => {
            article.Cc = 'first@contact.com';
            expect(formValue.enabled).true;
        });

        it('enable, but no recipient is set', async () => {
            await formValue.enable();
            expect(formValue.enabled).false;
        });

        it('enable, one recipient is set', async () => {
            article.To = 'first@contact.com';
            await formValue.enable();
            expect(formValue.enabled).true;
        });

        it('enable, one recipient is set but note', async () => {
            article.ChannelID = 1;
            article.To = 'first@contact.com';
            await formValue.enable();
            expect(formValue.enabled).false;
        });

        it('check if ticket contact has impact', async () => {
            article.ticket.ContactID = 123; // ony counts in new context
            expect(formValue.enabled).false;
        });

        it('check if ticket contact has impact (additional recipient in cc)', async () => {
            article.ticket.ContactID = 123; // ony counts in new context
            article.Cc = 'second@contact.com';
            expect(formValue.enabled).true;
        });

    });

    describe('Check enable state on object changes in NEW dialog', () => {

        let formValue: EncryptIfPossibleFormValue;
        let article: Article;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            objectFormValueMapper.formContext = FormContext.NEW;
            article = new Article();
            article.ChannelID = 2;
            const ticket = new Ticket();
            article.ticket = ticket;

            formValue = new EncryptIfPossibleFormValue(ArticleProperty.ENCRYPT_IF_POSSIBLE, article, objectFormValueMapper, null);

            await formValue.initFormValue();
        });

        afterEach(() => {
            article.To = null;
            article.Cc = null;
            article.Bcc = null;
            article.ChannelID = 2;
            article.ticket.ContactID = null;
        });

        // value should only be enabled if just one recipient is set and channel is email, contact field should count
        it('set one recipient', async () => {
            article.To = 'first@contact.com';
            expect(formValue.enabled).true;
        });

        it('set one recipient but note', async () => {
            article.To = 'first@contact.com';
            expect(formValue.enabled).true;
            article.ChannelID = 1;
            expect(formValue.enabled).false;
        });

        it('set two recipient', async () => {
            article.To = 'first@contact.com,second@contact.com';
            expect(formValue.enabled).false;
        });

        it('set two recipient (two properties)', async () => {
            article.To = 'first@contact.com';
            article.Cc = 'second@contact.com';
            expect(formValue.enabled).false;
        });

        it('set one recipient (other properties)', async () => {
            article.To = null;
            article.Cc = 'first@contact.com';
            expect(formValue.enabled).true;
        });

        it('enable, but no recipient is set', async () => {
            article.To = null;
            article.Cc = null;
            await formValue.enable();
            expect(formValue.enabled).false;
        });

        it('enable, one recipient is set', async () => {
            article.To = 'first@contact.com';
            await formValue.enable();
            expect(formValue.enabled).true;
        });

        it('enable, one recipient is set but note', async () => {
            article.ChannelID = 1;
            article.To = 'first@contact.com';
            await formValue.enable();
            expect(formValue.enabled).false;
        });

        it('check if ticket contact has impact', async () => {
            article.ticket.ContactID = 123; // should count
            expect(formValue.enabled).true;
        });

        it('check if ticket contact has impact (additional recipient in cc)', async () => {
            article.ticket.ContactID = 123; // should count
            article.Cc = 'second@contact.com';
            expect(formValue.enabled).false;
        });

        it('check if ticket contact has impact if note is used', async () => {
            article.ChannelID = 1;
            article.ticket.ContactID = 123;
            expect(formValue.enabled).false;
        });

    });

});
