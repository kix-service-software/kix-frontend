/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { ObjectIcon } from "../../model/ObjectIcon";

export class ObjectIconBrowserFactory implements IKIXObjectFactory<ObjectIcon> {

    private static INSTANCE: ObjectIconBrowserFactory;

    public static getInstance(): ObjectIconBrowserFactory {
        if (!ObjectIconBrowserFactory.INSTANCE) {
            ObjectIconBrowserFactory.INSTANCE = new ObjectIconBrowserFactory();
        }
        return ObjectIconBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(objectIcon: ObjectIcon): Promise<ObjectIcon> {
        return new ObjectIcon(null, null, null, null, objectIcon);
    }

}
