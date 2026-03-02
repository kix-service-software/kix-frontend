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
import path from 'path';
import fs from 'fs';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { ClientNotificationService } from '../../../server/services/ClientNotificationService';
import { BackendNotification } from '../../../model/BackendNotification';
import { BackendNotificationEvent } from '../../../model/BackendNotificationEvent';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';

export class FileService {

    static basePath: string = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'data');
    static defaultTTL: number = 30;     // keep the download file for 30s

    public static initialize(): void {
        LoggingService.getInstance().info('[SERVER] start FileService - initialization');

        const folder = ['downloads', 'uploads'];
        for (const f of folder) {
            const folderPath = path.join(this.basePath, f);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        }
        ClientNotificationService.getInstance().registerNotificationListener(
            'FileService',
            FileService.handleBackendNotification.bind(this)
        );

        LoggingService.getInstance().info('[SERVER] start FileService - initialization finished');
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

        const ttl = ConfigurationService.getEnvNumber('FILE_DOWNLOAD_TTL', this.defaultTTL);

        this.cleanupObsolete();

        try {
            file.downloadId = uuidv4() + `-${file.Filename}`;
            file.downloadSecret = uuidv4();
            let saved: boolean = true;
            try {
                const filePath = this.getFilePath(file.downloadId);
                fs.writeFileSync(filePath, file.Content, { encoding: 'base64' });

                // remove the file after TTL + 1s
                setTimeout(() => {
                    this.removeFile(file.downloadId, true);
                }, (ttl + 1) * 1000,);
            } catch (err) {
                LoggingService.getInstance().error(`Could not save file "${file.Filename}" for download (${err})`);
                saved = false;
            }

            delete file.Content;
        } catch (err) {
            LoggingService.getInstance().error(err);
        }
    }
    public static removeFile(filename: string, download: boolean = true): void {
        const filePath = this.getFilePath(filename, null, download);
        try {
            fs.rmSync(filePath);
            LoggingService.getInstance().debug(`FileService: deleted download file ${filePath} `);
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

    public static cleanupObsolete(): void {
        const ttl = ConfigurationService.getEnvNumber('FILE_DOWNLOAD_TTL', this.defaultTTL);

        const directory = this.getDownloadDirectory();
        const now: Date = new Date();
        try {
            const files = fs.readdirSync(directory);

            for (const file of files) {
                const filePath = path.join(directory, file);
                const stat = fs.statSync(filePath);
                if (stat.ctimeMs < now.getTime() - (ttl * 1000)) {
                    fs.unlinkSync(filePath);
                    LoggingService.getInstance().debug(`FileService: deleted obsolete download file ${filePath} `);
                }
            }
        } catch (e) {
            LoggingService.getInstance().error(`Could not remove obsolete files from ${directory}`, e);
        }
    }

    public static getDownloadDirectory(): string {
        return path.join(this.basePath, 'downloads');
    }

    public static getUploadDirectory(): string {
        return path.join(this.basePath, 'uploads');
    }

    private static getFilePath(filename?: string, targetPath?: string, download: boolean = true): string {
        let folder = download ? this.getDownloadDirectory() : this.getUploadDirectory();
        if (filename) {
            folder = path.join(folder, filename);
        }
        if (targetPath) {
            folder = path.join(this.basePath, '..', targetPath, filename);
        }
        return folder;
    }

    public static getFileContent(
        filename: string, download: boolean = true, encoding: BufferEncoding = 'base64'
    ): string {
        const filePath = this.getFilePath(filename, null, download);
        const content = fs.readFileSync(filePath, { encoding });
        return content;
    }

    public static async tailFile(filePath: string, tailCount: number): Promise<string[]> {
        const fs = require('fs/promises');
        const fd = await fs.open(filePath, 'r');
        const stat = await fd.stat();

        const chunkSize = 1024;
        let position = stat.size;
        let buffer = '';
        let lines = [];

        while (position > 0 && lines.length < tailCount) {
            const readSize = Math.min(chunkSize, position);
            position -= readSize;

            const { buffer: chunk } = await fd.read({
                buffer: Buffer.alloc(readSize),
                position,
                length: readSize
            });

            buffer = chunk.toString('utf8') + buffer;
            const parts = buffer.split('\n');
            if (position > 0) {
                buffer = parts.shift();
            }
            lines = [...parts, ...lines];
        }

        await fd.close();
        return lines.slice(-tailCount);
    }

}