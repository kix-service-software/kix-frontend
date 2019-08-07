/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Service } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class ServiceBrowserFactory implements IKIXObjectFactory<Service> {

    private static INSTANCE: ServiceBrowserFactory;

    public static getInstance(): ServiceBrowserFactory {
        if (!ServiceBrowserFactory.INSTANCE) {
            ServiceBrowserFactory.INSTANCE = new ServiceBrowserFactory();
        }
        return ServiceBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(service: Service): Promise<Service> {
        return new Service(service);
    }

}
