import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { UserService } from '../../../modules/user/server/UserService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { FileService } from '../../../modules/file/server/FileService';
import { routeConfiguration } from '../../routes/FastifyAuthentication';
import multer from 'fastify-multer';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.register(multer.contentParser);

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + '/../../../../../../data/uploads');
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

    fastify.get('/files/download/:downloadId', routeConfiguration(fastify), downloadFile);

    fastify.post(
        '/files/upload',
        { preHandler: upload.single('file') },
        (request, reply) => reply.code(200).send()
    );
}

async function downloadFile(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { downloadId } = (req as any).params;

    const token = APIUtil.getRequestData(req);
    const user = await UserService.getInstance().getUserByToken(token);

    if (!downloadId || !user?.UserID) {
        LoggingService.getInstance().error('Need downloadId and userId');
        reply.status(400).send('Invalid request!');
        return;
    }

    FileService.downloadFile(downloadId, user, reply);
}

export default routes;