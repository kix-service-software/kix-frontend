/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { Webform } from "../../model/Webform";

export class WebformBrowserFactory implements IKIXObjectFactory<Webform> {

    private static INSTANCE: WebformBrowserFactory;

    public static getInstance(): WebformBrowserFactory {
        if (!WebformBrowserFactory.INSTANCE) {
            WebformBrowserFactory.INSTANCE = new WebformBrowserFactory();
        }
        return WebformBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(webform: Webform): Promise<Webform> {
        return new Webform(webform);
    }

}
