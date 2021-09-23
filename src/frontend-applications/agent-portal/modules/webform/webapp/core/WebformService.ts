/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Webform } from '../../model/Webform';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { WebformSocketClient } from '.';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { ComponentContent } from '../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../modules/base-components/webapp/core/OverlayType';
import { WebformProperty } from '../../model/WebformProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

import { Error } from '../../../../../../server/model/Error';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../../modules/base-components/webapp/core/ServiceType';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';

export class WebformService extends KIXObjectService<Webform> {

    private static INSTANCE: WebformService = null;

    public static getInstance(): WebformService {
        if (!WebformService.INSTANCE) {
            WebformService.INSTANCE = new WebformService();
        }

        return WebformService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.WEBFORM);
        this.objectConstructors.set(KIXObjectType.WEBFORM, [Webform]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.WEBFORM;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let webforms = await WebformSocketClient.getInstance().loadWebforms();
        if (objectIds && objectIds.length) {
            webforms = webforms.filter((wf) => objectIds.some((oid) => Number(wf.ObjectId) === Number(oid)));
        }
        return webforms as any[];
    }

    public async createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const webform = await this.getWebformFromForm();
        const objectId = await WebformSocketClient.getInstance().createUpdateWebform(webform)
            .catch(async (error: Error) => {
                const content = new ComponentContent('list-with-title',
                    {
                        title: `Error while creating ${objectType}`,
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                );
                return null;
            });
        return objectId;
    }

    public async updateObjectByForm(
        objectType: KIXObjectType, formId: string, objectId: number | string, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const webform = await this.getWebformFromForm();
        const updatedObjectId = await WebformSocketClient.getInstance().createUpdateWebform(webform, Number(objectId))
            .catch(async (error: Error) => {
                const content = new ComponentContent('list-with-title',
                    {
                        title: `Error while updating ${objectType}`,
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                );
                return null;
            });
        return updatedObjectId;
    }

    private async getWebformFromForm(): Promise<Webform> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            KIXObjectType.WEBFORM, ServiceType.FORM
        );

        const parameter: Array<[string, any]> = await service.getFormParameter();
        return new Webform(null,
            this.getParameterValue(parameter, WebformProperty.BUTTON_LABEL),
            this.getParameterValue(parameter, WebformProperty.TITLE),
            this.getParameterValue(parameter, WebformProperty.SHOW_TITLE),
            this.getParameterValue(parameter, WebformProperty.SAVE_LABEL),
            this.getParameterValue(parameter, WebformProperty.HINT_MESSAGE),
            this.getParameterValue(parameter, WebformProperty.SUCCESS_MESSAGE),
            this.getParameterValue(parameter, WebformProperty.MODAL),
            this.getParameterValue(parameter, WebformProperty.USE_KIX_CSS),
            this.getParameterValue(parameter, WebformProperty.ALLOW_ATTACHMENTS),
            this.getParameterValue(parameter, WebformProperty.ACCEPTED_DOMAINS),
            this.getParameterValue(parameter, WebformProperty.QUEUE_ID),
            this.getParameterValue(parameter, WebformProperty.PRIORITY_ID),
            this.getParameterValue(parameter, WebformProperty.TYPE_ID),
            this.getParameterValue(parameter, WebformProperty.STATE_ID),
            this.getParameterValue(parameter, WebformProperty.USER_LOGIN),
            this.getParameterValue(parameter, WebformProperty.USER_PASSWORD),
            this.getParameterValue(parameter, KIXObjectProperty.VALID_ID)
        );
    }

    private getParameterValue(parameter: Array<[string, any]>, property: string): any {
        const param = parameter.find((p) => p[0] === property);
        return param && param.length ? param[1] : null;
    }

}
