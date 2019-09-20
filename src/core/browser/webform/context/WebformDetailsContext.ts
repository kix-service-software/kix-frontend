/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context, BreadcrumbInformation, KIXObject, KIXObjectType } from "../../../model";
import { LabelService } from "../../LabelService";
import { Webform } from "../../../model/webform";
import { TranslationService } from "../../i18n/TranslationService";
import { AdminContext } from "../../admin";
import { EventService } from "../../event";
import { ApplicationEvent } from "../../application";
import { KIXObjectService } from "../../kix";

export class WebformDetailsContext extends Context {

    public static CONTEXT_ID = 'webform-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Webform>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const webform = await this.getObject<Webform>();
        const objectName = await TranslationService.translate('Translatable#Webform');
        const suffix = webform && webform.title ? `: ${webform.title}` : '';
        return new BreadcrumbInformation(
            this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}${suffix}`
        );
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.WEBFORM, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTicketState(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.WEBFORM, changedProperties)
            );
        }

        return object;
    }

    private async loadTicketState(changedProperties: string[] = [], cache: boolean = true): Promise<Webform> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Webform' }
        );

        const webformId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load Webform'
            });
        }, 500);

        const ticketStates = await KIXObjectService.loadObjects<Webform>(
            KIXObjectType.WEBFORM, [webformId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearInterval(timeout);

        let webforms: Webform;
        if (ticketStates && ticketStates.length) {
            webforms = ticketStates[0];
            this.objectId = webforms.ObjectId;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return webforms;
    }

}
