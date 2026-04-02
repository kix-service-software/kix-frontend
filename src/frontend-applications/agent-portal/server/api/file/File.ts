/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { FileService } from '../../../modules/file/server/FileService';
import multer from 'fastify-multer';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.register(multer.contentParser);

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, FileService.getUploadDirectory());
        },
        filename: function (req: FastifyRequest, file, cb) {
            const { token } = APIUtil.getRequestData(req);
            const crypto = require('crypto');
            const md5 = crypto.createHash('md5').update(token).digest('hex');
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            cb(null, `${md5}-${file.originalname}`);
        }
    });
    const upload = multer({ storage: storage });

    fastify.post(
        '/files/upload',
        { preHandler: upload.single('file') },
        (request, reply) => reply.code(200).send()
    );
}

export default routes;