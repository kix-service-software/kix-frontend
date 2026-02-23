/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import fs from 'node:fs';
import path from 'node:path';
import { LoggingService } from '../../../../server/services/LoggingService';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/objecticons/:iconId/:contentType', handleObjectIcon);
}

async function handleObjectIcon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { iconId, contentType } = req.params as any;

    try {
        const objectIconsPath = ConfigurationService.getEnvString('OBJECT_ICONS_PATH');

        fs.readFile(path.join(objectIconsPath, iconId), (err, fileBuffer) => {
            if (err) {
                reply.status(404).send();
            }
            else {
                reply.header('Content-Type', contentType);
                reply.send(fileBuffer);
            }
        });
    } catch (e) {
        LoggingService.getInstance().error('Error resolving ObjectIcon.');
        LoggingService.getInstance().error(e);
        reply.status(404).send();
    }

    return reply;
}

export default routes;
