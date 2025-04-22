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
import { ClientNotificationService } from '../../../server/services/ClientNotificationService';
import { BackendNotification } from '../../../model/BackendNotification';
import { BackendNotificationEvent } from '../../../model/BackendNotificationEvent';
import { UserService } from '../../user/server/UserService';

export class FileService {

    public static initialize(): void {
        const folder = ['downloads', 'uploads'];
        for (const f of folder) {
            let folderPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'data', f);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        }
        ClientNotificationService.getInstance().registerNotificationListener(
            FileService.handleBackendNotification.bind(this));
    }

    private static handleBackendNotification(events: BackendNotification[]): void {
        const fileServiceEvents = events?.filter((e) => e.Namespace === 'FileService'
            && e.Event === BackendNotificationEvent.EXECUTE_COMMAND);
        if (fileServiceEvents?.some((fse) => fse.Data['Command'] === 'cleanup')) {
            FileService.cleanup();
        }
    }

    public static prepareFileForDownload(userId: number, file: IDownloadableFile): void {
        if (!file?.Filename) {
            LoggingService.getInstance().error('Got no file for download preparation');
            return;
        }
        if (!userId) {
            LoggingService.getInstance().error(`Need userId for download preparation ${file.Filename}`);
            return;
        }

        const downloads = this.getDownloads(userId);
        try {
            file.downloadId = uuidv4() + `-${file.Filename}`;
            file.downloadSecret = uuidv4();
            let saved: boolean = true;
            try {
                const filePath = this.getFilePath(file.downloadId);
                fs.writeFileSync(filePath, file.Content, { encoding: 'base64' });
            } catch (err) {
                LoggingService.getInstance().error(`Could not save file "${file.Filename}" for download (${err})`);
                saved = false;
            }
            if (saved) {
                const jsonFileName = `${userId}_downloads.json`;
                this.addFileToDownloads(file, downloads, jsonFileName);
            }

            delete file.Content;
        } catch (err) {
            LoggingService.getInstance().error(err);
        }
    }

    private static addFileToDownloads(
        file: IDownloadableFile, downloads: IDownloadableFile[] = [], downloadFileName: string
    ): void {
        const downloadFile: any = {
            downloadId: file.downloadId,
            downloadSecret: file.downloadSecret,
            Filename: file.Filename,
            FilesizeRaw: file.FilesizeRaw
        };
        downloads.push(downloadFile);

        ConfigurationService.getInstance().saveDataFileContent(downloadFileName, downloads);
    }

    public static async downloadFile(req: Request, res: Response, next: () => void): Promise<void> {
        const downloadId = req.params.downloadId;
        const user = await UserService.getInstance().getUserByToken(req.cookies.token);

        if (!downloadId || !user?.UserID) {
            LoggingService.getInstance().error('Need downloadId and userId');
            res.status(400);
            res.render('Invalid request!');
            return;
        }

        const file = FileService.getDownloadFile(downloadId, user?.UserID);
        if (file) {
            res.download(
                FileService.getFilePath(file.downloadId, file.path),
                file.Filename,
                (err) => {
                    if (err) {
                        LoggingService.getInstance().error(`Error while download file to client (downloadId: ${downloadId}, userId: ${user.UserID}).`, err);
                    }
                    // always remove/cleanup
                    FileService.removeDownload(downloadId, user?.UserID);
                }
            );
        } else {
            LoggingService.getInstance().error(`Relevant file not found in ${user?.UserID}_downloads.json (downloadId: ${downloadId}).`);
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

    public static removeDownload(downloadId: string, userId: number): void {
        const downloads = this.getDownloads(userId);
        const index = downloads.findIndex((d) => d.downloadId === downloadId);
        if (index !== -1) {
            const file = downloads[index];

            if (!file.path) {
                this.removeFile(file.downloadId);
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

    public static cleanup(): void {
        const directory = this.getFilePath();
        try {
            const files = fs.readdirSync(directory);

            for (const file of files) {
                const filePath = path.join(directory, file);
                fs.unlinkSync(filePath);
            }
            LoggingService.getInstance().debug(`FileService: cleanup of ${directory} deleted ${files.length} files`);
        } catch (e) {
            LoggingService.getInstance().error(`Could not cleanup ${directory}`, e);
        }
    }

    private static getFilePath(filename?: string, targetPath?: string, download: boolean = true): string {
        const folder = download ? 'downloads' : 'uploads';
        let filePath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'data', folder);
        if (filename) {
            filePath = path.join(filePath, filename);
        }
        if (targetPath) {
            filePath = path.join(__dirname, '..', '..', '..', '..', '..', '..', targetPath, filename);
        }
        return filePath;
    }

    public static getFileContent(
        filename: string, download: boolean = true, encoding: BufferEncoding = 'base64'
    ): string {
        const filePath = this.getFilePath(filename, null, download);
        const content = fs.readFileSync(filePath, { encoding });
        return content;
    }

}