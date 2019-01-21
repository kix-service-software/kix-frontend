/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { AttachmentUtil } from '../src/core/browser';
import { AttachmentError } from '../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / AttachmentUtil', () => {

    const MAX_UPLOAD_FILE_SIZE = 100;

    before(() => {
        AttachmentUtil.getMaxUploadFileSize = async (): Promise<number> => {
            return MAX_UPLOAD_FILE_SIZE;
        }
    });

    describe('file check', () => {
        it('Should return the max upload file size.', async () => {
            const maxUploadFileSize = await AttachmentUtil.getMaxUploadFileSize();
            expect(maxUploadFileSize).exist;
            expect(maxUploadFileSize).equals(MAX_UPLOAD_FILE_SIZE);
        });

        it('Should return MAX_FILE_SIZE_EXCEEDED error if file size is to large.', async () => {
            const file = {
                size: 1200
            }
            const error = await AttachmentUtil.checkFile((file as File));
            expect(error).exist;
            expect(error).equals(AttachmentError.MAX_FILE_SIZE_EXCEEDED);
        });

        it('Should not return error if file size is valid.', async () => {
            const file = {
                size: 50
            }
            const error = await AttachmentUtil.checkFile((file as File));
            expect(error).be.undefined;
        });

        it('Should return INVALID_MIMETYPE error if MIME-Type is invalid.', async () => {
            const file = {
                size: 50,
                type: 'image/png'
            }
            const error = await AttachmentUtil.checkFile((file as File), ['image/jpg', 'image/bmp']);
            expect(error).exist;
            expect(error).equals(AttachmentError.INVALID_MIMETYPE);
        });

        it('Should not return error if MIME-Type is valid.', async () => {
            const file = {
                size: 50,
                type: 'image/png'
            }
            const error = await AttachmentUtil.checkFile((file as File), ['image/jpg', 'image/bmp', 'image/png']);
            expect(error).be.undefined;
        });

    });

    describe('human readable file size', () => {
        it('Should return a valid file size string with KB with 1 decimal place.', () => {
            const fileSize = 1024;
            const fileSizeString = AttachmentUtil.getFileSize(fileSize);
            expect(fileSizeString).equals('1.0 kB');
        });

        it('Should return a valid file size string with Byte.', () => {
            const fileSize = 999;
            const fileSizeString = AttachmentUtil.getFileSize(fileSize);
            expect(fileSizeString).equals('999 Byte');
        });

        it('Should return a valid file size string with GB without decimal places.', () => {
            const fileSize = 1024 * 1024 * 1024;
            const fileSizeString = AttachmentUtil.getFileSize(fileSize, 0);
            expect(fileSizeString).equals('1 GB');
        });

        it('Should return a valid file size string with MB with 3 decimal places.', () => {
            const fileSize = 123456789;
            const fileSizeString = AttachmentUtil.getFileSize(fileSize, 3);
            expect(fileSizeString).equals('123.457 MB');
        });

        it('Should return a valid file size string with MB with 1 decimal place.', () => {
            const fileSize = 24000000;
            const fileSizeString = AttachmentUtil.getFileSize(fileSize);
            expect(fileSizeString).equals('24.0 MB');
        });

        it('Should return a valid file size string with GB with 2 decimal places.', () => {
            const fileSize = 50000000000000;
            const fileSizeString = AttachmentUtil.getFileSize(fileSize, 2);
            expect(fileSizeString).equals('50000.00 GB');
        });
    });
});

