/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXRouter } from '../../../server/routes/KIXRouter';
import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { FileService } from './FileService';


export class FileRouter extends KIXRouter {

    private static INSTANCE: FileRouter;

    public static getInstance(): FileRouter {
        if (!FileRouter.INSTANCE) {
            FileRouter.INSTANCE = new FileRouter();
        }
        return FileRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/files';
    }

    protected initialize(): void {
        this.router.get(
            '/download/:downloadId',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            FileService.downloadFile
        );

        const multer = require('multer');
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, __dirname + '/../../../../../../data/uploads');
            },
            filename: function (req, file, cb) {
                const token: string = req.cookies.token;
                const crypto = require('crypto');
                const md5 = crypto.createHash('md5').update(token).digest('hex');
                file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
                cb(null, `${md5}-${file.originalname}`, cb);
            }
        });

        const upload = multer({ storage });

        this.router.post(
            '/upload',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            upload.single('file'),
            FileService.uploadFile
        );
    }

}
