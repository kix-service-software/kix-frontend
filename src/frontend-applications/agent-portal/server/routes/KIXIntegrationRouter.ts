/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { WebformService } from '../../modules/webform/server/WebformService';
import { Webform } from '../../modules/webform/model/Webform';
import { Error } from '../../../../server/model/Error';


async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.options('/integrations/:formId', handleOptionsRequest);
    fastify.get('/integrations/:formId', handleGetRequest);
    fastify.post('/integrations/:formId', handlePostRequest);
}

async function handleOptionsRequest(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const form = await getForm(req);
    if (!form) {
        return reply.status(404).send();
    }

    handleCORS(form, req, reply);

    reply.status(204).send();
}

async function handleGetRequest(req: any, reply: FastifyReply): Promise<void> {
    const form = await getForm(req);
    if (!form) {
        return reply.status(404).send();
    }

    handleCORS(form, req, reply);

    const languages = req.languages();
    let userLanguage;
    let translations;
    if (languages && !!languages.length) {
        userLanguage = languages[0].split('-')[0];
        translations = await WebformService.getInstance().getWebformTranslationObject(
            form, userLanguage
        );
    }
    const template = require('../../modules/webform/webapp/components/webform').default;
    const htmlString = template.renderToString({ webform: form, translations });
    const tooManyFilesErrorMsg = await WebformService.getInstance().getTooManyFilesErrorMsg(userLanguage);
    const fileTooBigErrorMsg = await WebformService.getInstance().getFileTooBigErrorMsg(userLanguage);
    const maxFileSize = await WebformService.getInstance().getMaxFileSize();

    reply.status(200).send(JSON.stringify({
        htmlString: htmlString,
        buttonLabel: form.buttonLabel,
        modal: form.modal,
        tooManyFilesErrorMsg: tooManyFilesErrorMsg,
        fileTooBigErrorMsg: fileTooBigErrorMsg,
        maxFileSize: maxFileSize
    }));
}

async function handlePostRequest(req: any, reply: FastifyReply): Promise<void> {
    const form = await getForm(req);
    if (!form) {
        return reply.status(404).send();
    }

    handleCORS(form, req, reply);

    const languages = req.languages();
    const language = languages ? languages[0].split('-')[0] : null;
    const ticketId = await WebformService.getInstance().createTicket((req.body as any), Number(form.ObjectId), language)
        .catch((error) => {
            reply.status((error as Error).StatusCode ? error.StatusCode : 400)
                .send((error as Error).Message ? error.Message : error);
        });

    if (ticketId) {
        const successMessage = await WebformService.getInstance().getSuccessMessage(form, language);
        reply.status(201).send({ successMessage });
    }
}

async function getForm(req: FastifyRequest): Promise<Webform> {
    const { formId } = req.params as any;

    if (!/^\d+$/.test(formId)) {
        return;
    }

    const form = await WebformService.getInstance().getWebform(
        ConfigurationService.getBackendAPIToken(), Number(formId)
    );
    if (form?.ValidID !== 1 || !form?.acceptedDomains?.length) {
        return;
    }

    return form;
}

function handleCORS(form: Webform, req: FastifyRequest, reply: FastifyReply): void {
    let origin: string = 'false';
    if (form.acceptedDomains) {
        try {
            const regex = new RegExp(form.acceptedDomains);
            if (regex.test(req.headers.origin)) {
                origin = '*';
            }
        } catch {
            /* ignore */
        }
    }

    reply.header('Access-Control-Allow-Origin', origin)
        .header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type')
        .header('Vary', 'Origin');
}

export default routes;