/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { Organisation } from '../../../model/Organisation';
import { BreadcrumbInformation } from '../../../../../model/BreadcrumbInformation';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { OrganisationContext } from './OrganisationContext';

export class OrganisationDetailsContext extends Context {

    public static CONTEXT_ID: string = 'organisation-details';

    public getIcon(): string {
        return 'kix-icon-man-house';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return LabelService.getInstance().getObjectText(await this.getObject<Organisation>(), short, short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Organisation>();
        const text = await LabelService.getInstance().getObjectText(object);
        return new BreadcrumbInformation('kix-icon-organisation', [OrganisationContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.ORGANISATION, reload: boolean = false
    ): Promise<O> {
        let object;
        if (objectType === KIXObjectType.ORGANISATION) {
            object = await this.loadDetailsObject<O>(KIXObjectType.ORGANISATION,
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS]),
                null, true, undefined, true);

            if (reload) {
                this.listeners.forEach((l) => l.objectChanged(this.getObjectId(), object, KIXObjectType.ORGANISATION));
            }
        }

        return object;
    }

}
