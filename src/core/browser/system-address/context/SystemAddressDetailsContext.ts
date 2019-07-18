/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, BreadcrumbInformation, KIXObject, KIXObjectType, TicketPriority, SystemAddress
} from "../../../model";
import { AdminContext } from "../../admin";
import { EventService } from "../../event";
import { KIXObjectService } from "../../kix";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";
import { TranslationService } from "../../i18n/TranslationService";

export class SystemAddressDetailsContext extends Context {

    public static CONTEXT_ID = 'system-address-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<SystemAddress>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const categoryLabel = await TranslationService.translate('Translatable#Communication');
        const emailLabel = await TranslationService.translate('Translatable#Email');
        const systemAddress = await this.getObject<SystemAddress>();
        const breadcrumbText = `${categoryLabel}: ${emailLabel}: ${systemAddress.Name}`;
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], breadcrumbText);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS,
        reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadSystemAddress(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.SYSTEM_ADDRESS, changedProperties)
            );
        }

        return object;
    }

    private async loadSystemAddress(changedProperties: string[] = [], cache: boolean = true): Promise<SystemAddress> {
        const systemAddressesId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load System Address ...`
            });
        }, 500);

        const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
            KIXObjectType.SYSTEM_ADDRESS, [systemAddressesId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let systemAddress: SystemAddress;
        if (systemAddresses && systemAddresses.length) {
            systemAddress = systemAddresses[0];
            this.objectId = systemAddress.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return systemAddress;
    }

}
