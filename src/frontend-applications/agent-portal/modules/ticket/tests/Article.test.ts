/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

        // Attachments 
        const file2Attachment = new Attachment();
        file2Attachment.Filename = 'file-2';
        file2Attachment.Disposition = 'inline';

        const file1Attachment = new Attachment();
        file1Attachment.Filename = 'file-1';
        file1Attachment.Disposition = 'inline';

        const file1HTMLAttachment = new Attachment();
        file1HTMLAttachment.Filename = 'file-1.html';
        file1HTMLAttachment.Disposition = 'inline';

        // Articles
        const file2Article = new Article();
        file2Article.Attachments = [file2Attachment];

        const file1Article = new Article();
        file1Article.Attachments = [file1Attachment];

        const file1HTMLArticle = new Article();
        file1HTMLArticle.Attachments = [file1HTMLAttachment];

        const file2file1Article = new Article();
        file2file1Article.Attachments = [file2Attachment, file1Attachment];

        const file2file1HTMLArticle = new Article();
        file2file1HTMLArticle.Attachments = [file2Attachment, file1HTMLAttachment];

        it('should set the body attachment to file-2 if only file-2 is given', () => {
            const article = new Article(file2Article);
            expect(article.bodyAttachment).exist;
            expect(article.bodyAttachment.Filename).equals('file-2');
        });

        it('should set the body attachment to file-2 if file-2 and file-1 is given', () => {
            const article = new Article(file2file1Article);
            expect(article.bodyAttachment).exist;
            expect(article.bodyAttachment.Filename).equals('file-2');
        });

        it('should set the body attachment to file-2 if file-2 and file-1.html is given', () => {
            const article = new Article(file2file1HTMLArticle);
            expect(article.bodyAttachment).exist;
            expect(article.bodyAttachment.Filename).equals('file-2');
        });

        it('should set the body attachment to file-1 if no file-2 and file-1 is given', () => {
            const article = new Article(file1Article);
            expect(article.bodyAttachment).exist;
            expect(article.bodyAttachment.Filename).equals('file-1');
        });

        it('should set the body attachment to file-1.html if no file-2 and file-1.html is given', () => {
            const article = new Article(file1HTMLArticle);
            expect(article.bodyAttachment).exist;
            expect(article.bodyAttachment.Filename).equals('file-1.html');
        });
    });

});