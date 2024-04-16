/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDownloadableFile } from '../../../model/IDownloadableFile';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { createHash } from 'node:crypto';
import { Request, Response } from 'express';
import { LoggingService } from '../../../../../server/services/LoggingService';

export class FileService {

    public static prepareFileForDownload(userId: number, file: IDownloadableFile): void {
        const downloads = this.getDownloads(userId);
        const fileName = `${userId}_downloads.json`;
        try {
            if (!downloads.some((f) => f.Filename === file.Filename && f.FilesizeRaw === file.FilesizeRaw)) {
                if (!file.path) {
                    const filePath = this.getFilePath(file.Filename);
                    fs.writeFileSync(filePath, file.Content, { encoding: 'base64' });
                }
                this.addFileToDownloads(file, downloads, fileName);
            } else {
                const existingFile = downloads.find(
                    (f) => f.Filename === f.Filename && f.FilesizeRaw === f.FilesizeRaw
                );

                file.downloadId = existingFile.downloadId;
                file.downloadSecret = existingFile.downloadSecret;
            }

            delete file.Content;
        } catch (err) {
            console.error(err);
        }
    }

    private static addFileToDownloads(
        file: IDownloadableFile, downloads: IDownloadableFile[] = [], downloadFileName: string
    ): void {
        file.downloadId = uuidv4();
        file.downloadSecret = uuidv4();


        let hash: string;
        if (file?.Content) {
            hash = createHash('md5').update(file.Content).digest('hex').toString();
        }

        const downloadFile: any = {
            Content: null,
            downloadId: file.downloadId,
            downloadSecret: file.downloadSecret,
            Filename: file.Filename,
            FilesizeRaw: file.FilesizeRaw,
            md5Sum: hash,
            path: file.path
        };
        downloads.push(downloadFile);

        ConfigurationService.getInstance().saveDataFileContent(downloadFileName, downloads);
    }

    public static downloadFile(req: Request, res: Response, next: () => void): void {
        const downloadId = req.params.downloadId;
        const userId = Number(req.query.userid);

        if (!downloadId || !userId) {
            res.status(400);
            res.render('Invalid request!');
            return;
        }

        const file = FileService.getDownloadFile(downloadId, userId);
        if (file) {
            res.download(FileService.getFilePath(file.Filename, file.path), (err) => {
                if (err) {
                    LoggingService.getInstance().error('Error while download file to client.', err);
                } else {
                    FileService.removeDownload(downloadId, userId);
                }
            });

        } else {
            res.status(400);
            res.render('Invalid request!');
            return;
        }

    }

    private static getDownloadFile(downloadId: string, userId: number): IDownloadableFile {
        const downloads = this.getDownloads(userId);
        const file = downloads.find((d) => d.downloadId === downloadId);
        return file;
    }

    private static getDownloads(userId: number): IDownloadableFile[] {
        const fileName = `${userId}_downloads.json`;
        let downloads: IDownloadableFile[] = ConfigurationService.getInstance().getDataFileContent(fileName, []);

        if (!Array.isArray(downloads)) {
            downloads = [];
        }

        return downloads;
    }

    private static removeDownload(downloadId: string, userId: number): void {
        const downloads = this.getDownloads(userId);
        const index = downloads.findIndex((d) => d.downloadId === downloadId);
        if (index !== -1) {
            const file = downloads[index];

            if (!file.path) {
                this.removeFile(file.Filename);
            }

            downloads.splice(index, 1);
            const fileName = `${userId}_downloads.json`;
            ConfigurationService.getInstance().saveDataFileContent(fileName, downloads);
        }
    }

    public static uploadFile(req: Request, res: Response, next: () => void): void {
        res.status(201);
        res.send();
    }

    public static removeFile(filename: string, download: boolean = true): void {
        const filePath = this.getFilePath(filename, null, download);
        try {
            fs.rmSync(filePath);
        } catch (e) {
            LoggingService.getInstance().error(`Could not delete file: ${filePath}`, e);
        }
    }

    private static getFilePath(filename: string, targetPath?: string, download: boolean = true): string {
        const folder = download ? 'downloads' : 'uploads';
        let filePath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'data', folder, filename);
        if (targetPath) {
            filePath = path.join(__dirname, '..', '..', '..', '..', '..', '..', targetPath, filename);
        }
        return filePath;
    }

    public static getFileContent(filename: string, download: boolean = true): string {
        const filePath = this.getFilePath(filename, null, download);
        const content = fs.readFileSync(filePath, { encoding: 'base64' });
        return content;
    }

}