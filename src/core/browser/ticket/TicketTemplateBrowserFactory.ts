/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketTemplate } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketTemplateBrowserFactory implements IKIXObjectFactory<TicketTemplate> {

    private static INSTANCE: TicketTemplateBrowserFactory;

    public static getInstance(): TicketTemplateBrowserFactory {
        if (!TicketTemplateBrowserFactory.INSTANCE) {
            TicketTemplateBrowserFactory.INSTANCE = new TicketTemplateBrowserFactory();
        }
        return TicketTemplateBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(template: TicketTemplate): Promise<TicketTemplate> {
        return new TicketTemplate(template);
    }

}
