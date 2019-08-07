/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, Organisation, KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions
} from '../../../model';
import { OrganisationContext } from './OrganisationContext';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { LabelService } from '../../LabelService';
import { ApplicationEvent } from '../../application';

export class OrganisationDetailsContext extends Context {

    public static CONTEXT_ID: string = 'organisation-details';

    public getIcon(): string {
        return 'kix-icon-man-house';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return LabelService.getInstance().getText(await this.getObject<Organisation>(), short, short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Organisation>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation('kix-icon-organisation', [OrganisationContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.ORGANISATION, reload: boolean = false
    ): Promise<O> {
        const object = await this.loadOrganisation() as any;

        if (reload) {
            this.listeners.forEach((l) => l.objectChanged(this.getObjectId(), object, KIXObjectType.ORGANISATION));
        }

        return object;
    }

    private async loadOrganisation(): Promise<Organisation> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, ['Contacts', 'Tickets', 'TicketStats'],
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Organisation' }
            );
        }, 500);

        const organisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, [this.objectId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let organisation: Organisation;
        if (organisations && organisations.length) {
            organisation = organisations[0];
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

        return organisation;
    }
}
