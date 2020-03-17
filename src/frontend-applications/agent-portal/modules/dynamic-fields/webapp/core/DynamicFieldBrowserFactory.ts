/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { DynamicField } from "../../model/DynamicField";

export class DynamicFieldBrowserFactory implements IKIXObjectFactory<DynamicField> {

    private static INSTANCE: DynamicFieldBrowserFactory;

    public static getInstance(): DynamicFieldBrowserFactory {
        if (!DynamicFieldBrowserFactory.INSTANCE) {
            DynamicFieldBrowserFactory.INSTANCE = new DynamicFieldBrowserFactory();
        }
        return DynamicFieldBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(dynamicField: DynamicField): Promise<DynamicField> {
        return new DynamicField(dynamicField);
    }

}
