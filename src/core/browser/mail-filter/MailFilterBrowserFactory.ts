/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MailFilter } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class MailFilterBrowserFactory extends KIXObjectFactory<MailFilter> {

    private static INSTANCE: MailFilterBrowserFactory;

    public static getInstance(): MailFilterBrowserFactory {
        if (!MailFilterBrowserFactory.INSTANCE) {
            MailFilterBrowserFactory.INSTANCE = new MailFilterBrowserFactory();
        }
        return MailFilterBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(mailFilter: MailFilter): Promise<MailFilter> {
        const newMailFilter = new MailFilter(mailFilter);
        return newMailFilter;
    }

}
