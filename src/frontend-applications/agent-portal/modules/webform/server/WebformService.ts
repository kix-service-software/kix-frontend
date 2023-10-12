/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Webform } from '../model/Webform';
import { ModuleConfigurationService } from '../../../server/services/configuration/ModuleConfigurationService';
import { DateTimeUtil } from '../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXIntegrationRouter } from './KIXIntegrationRouter';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { CreateWebformTicketRequest } from '../model/CreateWebformTicketRequest';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { IdService } from '../../../model/IdService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { TicketProperty } from '../../ticket/model/TicketProperty';
import { ArticleProperty } from '../../ticket/model/ArticleProperty';
import { Attachment } from '../../../model/kix/Attachment';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { SysConfigOption } from '../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../sysconfig/model/SysConfigKey';
import { Error } from '../../../../../server/model/Error';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { TranslationAPIService } from '../../translation/server/TranslationService';

import addrparser from 'address-rfc2822';
import { SysConfigAccessLevel } from '../../sysconfig/model/SysConfigAccessLevel';
import { UserType } from '../../user/model/UserType';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class WebformService {

    private static INSTANCE: WebformService;

    public static getInstance(): WebformService {
        if (!WebformService.INSTANCE) {
            WebformService.INSTANCE = new WebformService();
        }
        return WebformService.INSTANCE;
    }

    private constructor() { }

    public async loadWebforms(token: string, withPassword: boolean = false): Promise<Webform[]> {
        const configuration = await ModuleConfigurationService.getInstance().loadConfiguration<any>(
            token, 'kix-customer-portal-light-webforms'
        ).catch(() => null);
        const webforms: Webform[] = configuration?.webforms || [];
        if (!withPassword) {
            webforms.forEach((wf) => delete wf.webformUserPassword);
        }
        return webforms;
    }

    public async getWebform(token: string, formId: number, withPassword?: boolean): Promise<Webform> {
        let form;
        if (formId) {
            const forms = await this.loadWebforms(token, withPassword);
            if (forms && forms.length) {
                form = forms.find((f) => f.ObjectId === Number(formId));
            }
        }
        return form;
    }

    public async saveWebform(token: string, userId: number, webform: Webform, webformId?: number): Promise<number> {
        const date = DateTimeUtil.getKIXDateTimeString(new Date());

        const webforms = await this.loadWebforms(token, true);

        webform.ChangeBy = userId;
        webform.ChangeTime = date;
        if (!webformId) {
            webform.CreateBy = userId;
            webform.CreateTime = date;
            webform.ObjectId = Date.now();
            webforms.push(webform);
        } else {
            webform.ObjectId = webformId;
            const webformIndex = webforms.findIndex((f) => f.ObjectId === Number(webformId));
            if (webformIndex !== -1) {
                webform.CreateBy = webforms[webformIndex].CreateBy;
                webform.CreateTime = webforms[webformIndex].CreateTime;
                if (!webform.webformUserPassword || webform.webformUserPassword === '--NOT_CHANGED--') {
                    webform.webformUserPassword = webforms[webformIndex].webformUserPassword;
                }
                webforms.splice(webformIndex, 1, webform);
            }
        }

        const config = {
            id: 'kix-customer-portal-light-webforms',
            name: 'customer portal light webforms configuration',
            type: 'Webform',
            webforms,
            application: 'agent-portal',
            valid: true
        };

        await ModuleConfigurationService.getInstance().saveConfiguration(
            token, config, SysConfigAccessLevel.CONFIDENTIAL
        ).then(() => {
            KIXIntegrationRouter.getInstance().registerRoute(Number(webform.ObjectId));
        }).catch((error: Error) => {
            LoggingService.getInstance().error(error.Message, error);
        });

        return webform.ObjectId;
    }

    public async createTicket(request: CreateWebformTicketRequest, formId: number, language?: string): Promise<number> {
        let errorString = await this.checkRequest(request, language);
        if (formId && !errorString) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const form = await this.getWebform(serverConfig.BACKEND_API_TOKEN, formId, true);

            if (form && form.userLogin && form.webformUserPassword) {
                const parameter = this.prepareParameter(request, form);

                const token = await AuthenticationService.getInstance().login(
                    form.userLogin, form.webformUserPassword, UserType.AGENT, null,
                    'WebformService', null, false
                ).catch((error) => null);

                if (token) {
                    const service = KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.TICKET);
                    const result = await service.createObject(
                        token, null, KIXObjectType.TICKET, parameter, null, null
                    ).catch((error) => null);
                    AuthenticationService.getInstance().logout(token).catch((error) => null);
                    if (result) {
                        return result;
                    }
                }
            }

            errorString = await TranslationAPIService.getInstance().translate(
                'Translatable#Could not handle request.', undefined, language
            );
        }

        throw new Error(null, errorString, 400);
    }

    private async checkRequest(request: CreateWebformTicketRequest, language?: string): Promise<string> {
        let errorString;
        if (!request.name) {
            errorString = await TranslationAPIService.getInstance().translate(
                'Translatable#{0} is required.', ['Name'], language
            );
        } else if (!request.email) {
            errorString = await TranslationAPIService.getInstance().translate(
                'Translatable#{0} is required.', ['Email'], language
            );
        } else if (!this.checkEmail(request.email)) {
            errorString = await TranslationAPIService.getInstance().translate(
                'Translatable#Inserted email address is invalid', undefined, language
            ) + '.';
        } else if (!request.subject) {
            errorString = await TranslationAPIService.getInstance().translate(
                'Translatable#{0} is required.', ['Subject'], language
            );
        } else if (!request.message) {
            errorString = await TranslationAPIService.getInstance().translate(
                'Translatable#{0} is required.', ['Message'], language
            );
        } else {
            errorString = await this.checkFiles(request.files, language);
        }
        return errorString;
    }

    private prepareParameter(request: CreateWebformTicketRequest, form: Webform): Array<[string, any]> {
        const from = request.name && !request.email.match(/.+ <.+>/)
            ? `${request.name} <${request.email}>` : request.email;
        const parameter: Array<[string, any]> = [
            [TicketProperty.TITLE, request.subject],
            [TicketProperty.CONTACT_ID, request.email],
            [TicketProperty.STATE_ID, form.StateID],
            [TicketProperty.PRIORITY_ID, form.PrioritiyID],
            [TicketProperty.QUEUE_ID, form.QueueID],
            [TicketProperty.TYPE_ID, form.TypeID],
            [TicketProperty.OWNER_ID, 1],
            [TicketProperty.RESPONSIBLE_ID, 1],
            [ArticleProperty.FROM, from],
            [ArticleProperty.SUBJECT, request.subject],
            [ArticleProperty.BODY, request.message],
            [ArticleProperty.SENDER_TYPE_ID, 3],
            [ArticleProperty.CUSTOMER_VISIBLE, 1],
            [ArticleProperty.CHANNEL_ID, 1],
        ];
        const attachments = this.prepareFiles(request.files);
        if (attachments.length) {
            parameter.push([ArticleProperty.ATTACHMENTS, attachments]);
        }
        return parameter;
    }

    // TODO: copied from FormValidationService
    private checkEmail(email: string): boolean {
        let isValidEmail: boolean = true;
        try {
            addrparser.parse(email.trim().toLowerCase());
        } catch {
            isValidEmail = false;
        }
        return isValidEmail;
    }

    private async checkFiles(filesWithContent: any[], language?: string): Promise<string> {
        if (filesWithContent && !!filesWithContent.length) {
            if (filesWithContent.length > 5) {
                return await TranslationAPIService.getInstance().translate(
                    'Translatable#Not more than 5 files possible.', undefined, language
                );
            } else {
                const maxSize = await this.getMaxFileSize();
                for (const file of filesWithContent) {
                    if (maxSize && file.size > maxSize) {
                        const error = file.name + ': ' + await TranslationAPIService.getInstance().translate(
                            'Translatable#is to large (max {0}).',
                            [this.getFileSize(maxSize)], language
                        );
                        return error;
                    }
                    if (!file.content) {
                        return await TranslationAPIService.getInstance().translate(
                            'Translatable#Could not load file {0}.',
                            [file.name], language
                        );
                    }
                }
            }
        }
        return;
    }

    private prepareFiles(filesWithContent: any[]): Attachment[] {
        const attachments: Attachment[] = [];
        filesWithContent.forEach((f) => {
            const attachment = new Attachment();
            attachment.ContentType = f.type !== '' ? f.type : 'text';
            attachment.Filename = f.name;
            attachment.Content = f.content;
            attachment.FilesizeRaw = f.size;
            attachments.push(attachment);
        });
        return attachments;
    }

    public async getMaxFileSize(): Promise<number> {
        let maxSize = 1000 * 1000 * 24; // 24 MB
        const config = ConfigurationService.getInstance().getServerConfiguration();
        if (config && config.BACKEND_API_TOKEN) {
            const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                config.BACKEND_API_TOKEN, IdService.generateDateBasedId('webform-service-'),
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.MAX_ALLOWED_SIZE], null, null
            ).catch((error) => new ObjectResponse<SysConfigOption>());

            const maxSizeOptions = objectResponse?.objects || [];
            if (maxSizeOptions && !!maxSizeOptions.length && maxSizeOptions[0].Value) {
                maxSize = maxSizeOptions[0].Value;
            }
        }
        return maxSize;
    }

    public async getSuccessMessage(form: Webform, language?: string): Promise<string> {
        return await TranslationAPIService.getInstance().translate(form.successMessage, undefined, language);
    }

    public async getTooManyFilesErrorMsg(language?: string): Promise<string> {
        return await TranslationAPIService.getInstance().translate(
            'Translatable#Not more than 5 files possible.', undefined, language
        );
    }

    public async getFileTooBigErrorMsg(form: Webform, language?: string): Promise<string> {
        const maxSize = await this.getMaxFileSize();
        return await TranslationAPIService.getInstance().translate(
            'Translatable#is to large (max {0}).', [this.getFileSize(maxSize)], language
        );
    }

    public async getWebformTranslationObject(form: Webform, language?: string): Promise<any> {
        const translationObject = {};
        const patterns = [
            form.buttonLabel ? form.buttonLabel : 'Translatable#Feedback',
            form.saveLabel ? form.buttonLabel : 'Translatable#Submit',
            form.title, form.hintMessage,
            'Translatable#Name', 'Translatable#Email', 'Translatable#Subject', 'Translatable#Message',
            'Translatable#Attachments', 'Translatable#Close', 'Translatable#Cancel',
            'Translatable#All form fields marked by * are required fields.'
        ];
        for (const pattern of patterns) {
            const text = await TranslationAPIService.getInstance().translate(pattern, undefined, language);
            translationObject[pattern] = text;
        }
        return translationObject;
    }

    // TODO: copied from AttachmentUtil
    private getFileSize(fileSize: number, decPlaces: number = 1): string {
        let sizeString = fileSize + ' Byte';
        const siteUnits = ['kB', 'MB', 'GB'];
        for (
            let newSize = fileSize / 1000, sizeUnit = 0;
            newSize >= 1 && sizeUnit < 3;
            newSize /= 1000, sizeUnit++
        ) {
            sizeString = newSize.toFixed(decPlaces) + ' ' + siteUnits[sizeUnit];
        }
        return sizeString;
    }

}
