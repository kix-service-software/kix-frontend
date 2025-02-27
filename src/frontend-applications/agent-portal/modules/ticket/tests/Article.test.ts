/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Attachment } from '../../../model/kix/Attachment';
import { Article } from '../model/Article';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Article', () => {

    describe('Get article body attachment', () => {

        // prepare attachments for test
        const preparedAttachments = [];
        ['file-1.html', 'file-2', 'file-1', 'file-3'].forEach(function (fileName) {
            preparedAttachments[fileName] = [];
            ['inline', 'attachment'].forEach(function (disposition) {
                preparedAttachments[fileName][disposition] = [];
                ['text/html', 'text/plain'].forEach(function (contentType) {
                    const attachment = new Attachment();
                    attachment.Filename = fileName;
                    attachment.Disposition = disposition;
                    attachment.ContentType = contentType;

                    preparedAttachments[fileName][disposition][contentType] = attachment;
                });
            });
        });

        // test body attachment with single file given
        ['file-1.html', 'file-2', 'file-1', 'file-3'].forEach(function (fileName) {
            ['inline', 'attachment'].forEach(function (disposition) {
                ['text/html', 'text/plain'].forEach(function (contentType) {
                    const testArticle = new Article();
                    testArticle.Attachments = [preparedAttachments[fileName][disposition][contentType]];
                    const article = new Article(testArticle);

                    // positive tests
                    // fileName one of ['file-1.html','file-2','file-1'] AND disposition 'inline' AND contentType 'text/html'
                    if (
                        fileName !== 'file-3'
                        && disposition === 'inline'
                        && contentType === 'text/html'
                    ) {
                        it('should set the body attachment to ' + fileName + ' if only ' + fileName + '(' + disposition + ';' + contentType + ') is given', () => {
                            expect(article.bodyAttachment).exist;
                            expect(article.bodyAttachment.Filename).equals(fileName);
                        });
                    }
                    // negative tests
                    else {
                        it('should NOT set the body attachment if only ' + fileName + '(' + disposition + ';' + contentType + ') is given', () => {
                            expect(article.bodyAttachment).null;
                        });
                    }
                });
            });
        });

        // test body attachment when file-1.html(inline;text/html) is given together with an other attachment
        ['file-2', 'file-1', 'file-3'].forEach(function (fileName) {
            ['inline', 'attachment'].forEach(function (disposition) {
                ['text/html', 'text/plain'].forEach(function (contentType) {
                    const testArticle = new Article();
                    testArticle.Attachments = [preparedAttachments[fileName][disposition][contentType], preparedAttachments['file-1.html']['inline']['text/html']];
                    const article = new Article(testArticle);
                    it('should set the body attachment to file-1.html if ' + fileName + '(' + disposition + ';' + contentType + ') and file-1.html(inline;text/html) are given', () => {
                        expect(article.bodyAttachment).exist;
                        expect(article.bodyAttachment.Filename).equals('file-1.html');
                    });
                });
            });
        });

        // test body attachment when file-2(inline;text/html) is given together with an other attachment
        ['file-1.html', 'file-1', 'file-3'].forEach(function (fileName) {
            ['inline', 'attachment'].forEach(function (disposition) {
                ['text/html', 'text/plain'].forEach(function (contentType) {
                    // do not test together with file-1.html(inline;text/html)
                    if (
                        fileName === 'file-1.html'
                        && disposition === 'inline'
                        && contentType === 'text/html'
                    ) {
                        return;
                    }

                    // prepare article with combined attachments
                    const testArticle = new Article();
                    testArticle.Attachments = [preparedAttachments[fileName][disposition][contentType], preparedAttachments['file-2']['inline']['text/html']];
                    const article = new Article(testArticle);
                    it('should set the body attachment to file-2 if ' + fileName + '(' + disposition + ';' + contentType + ') and file-2(inline;text/html) are given', () => {
                        expect(article.bodyAttachment).exist;
                        expect(article.bodyAttachment.Filename).equals('file-2');
                    });
                });
            });
        });

        // test body attachment when file-1(inline;text/html) is given together with an other attachment
        ['file-1.html', 'file-2', 'file-3'].forEach(function (fileName) {
            ['inline', 'attachment'].forEach(function (disposition) {
                ['text/html', 'text/plain'].forEach(function (contentType) {
                    // do not test together with file-1.html(inline;text/html) OR file-2(inline;text/html)
                    if (
                        (
                            fileName === 'file-1.html'
                            || fileName === 'file-2'
                        )
                        && disposition === 'inline'
                        && contentType === 'text/html'
                    ) {
                        return;
                    }

                    // prepare article with combined attachments
                    const testArticle = new Article();
                    testArticle.Attachments = [preparedAttachments[fileName][disposition][contentType], preparedAttachments['file-1']['inline']['text/html']];
                    const article = new Article(testArticle);
                    it('should set the body attachment to file-1 if ' + fileName + '(' + disposition + ';' + contentType + ') and file-1(inline;text/html) are given', () => {
                        expect(article.bodyAttachment).exist;
                        expect(article.bodyAttachment.Filename).equals('file-1');
                    });
                });
            });
        });
    });
});