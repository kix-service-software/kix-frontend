/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { Organisation } from "../../model/Organisation";

export class OrganisationBrowserFactory implements IKIXObjectFactory<Organisation> {

    private static INSTANCE: OrganisationBrowserFactory;

    public static getInstance(): OrganisationBrowserFactory {
        if (!OrganisationBrowserFactory.INSTANCE) {
            OrganisationBrowserFactory.INSTANCE = new OrganisationBrowserFactory();
        }
        return OrganisationBrowserFactory.INSTANCE;
    }

    public async create(organisation: Organisation): Promise<Organisation> {
        return new Organisation(organisation);
    }

}
