import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { TicketAPIService } from '../../../modules/ticket/server/TicketService';
import { Readable } from 'node:stream';
import { Attachment } from '../../../model/kix/Attachment';
import { CheckUtil } from '../../../model/CheckUtil';
import { ArticleViewUtil } from '../../../modules/ticket/server/ArticleViewUtil';
import path from 'path';
import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/tickets/:ticketId/articles/:articleId', getArticlePage);
    fastify.get(
        '/tickets/:ticketId/articles/:articleId/:attachmentIds', routeConfiguration(fastify), loadArticleAttachments
    );
    fastify.get('/tickets/:ticketId/articles/:articleId/zip', routeConfiguration(fastify), loadArticleZipAttachment);
    fastify.post('/tickets/:ticketId/articles/:articleId/seen', routeConfiguration(fastify), setArticleSeenFlag);
}

async function getArticlePage(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const templatePath = path.join('..', '..', '..', 'modules', 'ticket', 'webapp', 'components', 'article-view');
    const template = require(templatePath).default;

    const { relevantOrganisationId, profileRequestId } = APIUtil.getRequestData(req);
    const { ticketId, articleId } = req.params as any;
    const { lineCount, reduceContent, resolveInlineCSS, prepareInline, application } = req.query as any;
    const token = APIUtil.getToken(req, application);

    const linesCount = CheckUtil.isNumeric(lineCount) ? Number(lineCount) : null;

    const content = await ArticleViewUtil.getArticleHTMLContent(
        token, articleId, ticketId, reduceContent === 'true',
        Number(resolveInlineCSS) === 1, linesCount, prepareInline === 'true',
        relevantOrganisationId, profileRequestId
    );

    return (reply as any).marko(template, { content: content });
}

async function loadArticleAttachments(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, relevantOrganisationId } = APIUtil.getRequestData(req);
    const { ticketId, articleId } = req.params as any;
    const { asDownload } = req.query as any;

    let { attachmentIds } = req.params as any;

    if (typeof attachmentIds === 'string') {
        attachmentIds = attachmentIds.split(',');
    }

    let status = 200;
    let result = { attachments: [] };

    const attachments = await TicketAPIService.getInstance().loadArticleAttachments(
        token, ticketId, articleId, attachmentIds, relevantOrganisationId, asDownload
    ).catch((error) => {
        status = 400;
        result = error;
        return reply.status(status).send(result);
    });

    if (status === 200) {
        result = { attachments };
    }

    return reply.status(status).send(result);

}

async function loadArticleZipAttachment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, relevantOrganisationId, profileRequestId } = APIUtil.getRequestData(req);
    const { ticketId, articleId } = req.params as any;

    let status = 200;
    let result = { attachment: null };

    const attachment = await TicketAPIService.getInstance().loadArticleZipAttachment(
        token, ticketId, articleId, relevantOrganisationId, profileRequestId
    ).catch((error): Attachment => {
        status = 400;
        result = error;
        return null;
    });

    if (attachment?.Content) {
        const buffer = Buffer.from(attachment.Content, 'base64');
        const stream = Readable.from(buffer);
        return reply
            .type(attachment.ContentType)
            .header('Content-Type', 'application/octet-stream')
            .header('Content-Length', attachment.FilesizeRaw)
            .header('Content-Disposition', `attachment;filename=${attachment.Filename}`)
            .send(stream);
    } else {
        return reply.status(400).send('No zip attachment available for download');
    }
}

async function setArticleSeenFlag(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { ticketId, articleId } = req.params as any;

    let status = 200;
    let result = {};

    await TicketAPIService.getInstance().setArticleSeenFlag(token, null, ticketId, articleId).catch((error) => {
        status = 400;
        result = error;
    });

    return reply.status(status).send(result);
}

export default routes;