/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { Webform, WebformProperty } from "../../model/webform";
import {
    KIXObjectType, KIXObject, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, KIXObjectSpecificCreateOptions,
    ComponentContent, Error, OverlayType, KIXObjectProperty
} from "../../model";
import { WebformSocketClient } from "./WebformSocketClient";
import { OverlayService } from "../OverlayService";

export class WebformService extends KIXObjectService<Webform> {

    private static INSTANCE: WebformService = null;

    public static getInstance(): WebformService {
        if (!WebformService.INSTANCE) {
            WebformService.INSTANCE = new WebformService();
        }

        return WebformService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.WEBFORM;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        const webforms = await WebformSocketClient.getInstance().loadWebforms();
        return webforms as any[];
    }

    public async createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId);
        const webform = new Webform(null,
            this.getParameterValue(parameter, WebformProperty.BUTTON_LABEL),
            this.getParameterValue(parameter, WebformProperty.TITLE),
            this.getParameterValue(parameter, WebformProperty.SHOW_TITLE),
            this.getParameterValue(parameter, WebformProperty.SAVE_LABEL),
            this.getParameterValue(parameter, WebformProperty.HINT_MESSAGE),
            this.getParameterValue(parameter, WebformProperty.SUCCESS_MESSAGE),
            this.getParameterValue(parameter, WebformProperty.MODAL),
            this.getParameterValue(parameter, WebformProperty.USE_KIX_CSS),
            this.getParameterValue(parameter, WebformProperty.ALLOW_ATTACHMENTS),
            this.getParameterValue(parameter, WebformProperty.QUEUE_ID),
            this.getParameterValue(parameter, WebformProperty.PRIORITY_ID),
            this.getParameterValue(parameter, WebformProperty.TYPE_ID),
            this.getParameterValue(parameter, WebformProperty.STATE_ID),
            this.getParameterValue(parameter, WebformProperty.USER_ID),
            this.getParameterValue(parameter, KIXObjectProperty.VALID_ID)
        );

        const objectId = await WebformSocketClient.getInstance().createWebform(webform)
            .catch(async (error: Error) => {
                const content = new ComponentContent('list-with-title',
                    {
                        title: `Error while creating ${objectType}`,
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Translatable#Error!', true
                );
                return null;
            });
        return objectId;
    }

    private getParameterValue(parameter: Array<[string, any]>, property: string): any {
        const param = parameter.find((p) => p[0] === property);
        return param && param.length ? param[1] : null;
    }

}
