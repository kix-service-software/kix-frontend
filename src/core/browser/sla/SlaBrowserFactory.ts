/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Sla } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class SlaBrowserFactory implements IKIXObjectFactory<Sla> {

    private static INSTANCE: SlaBrowserFactory;

    public static getInstance(): SlaBrowserFactory {
        if (!SlaBrowserFactory.INSTANCE) {
            SlaBrowserFactory.INSTANCE = new SlaBrowserFactory();
        }
        return SlaBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(sla: Sla): Promise<Sla> {
        return new Sla(sla);
    }

}
