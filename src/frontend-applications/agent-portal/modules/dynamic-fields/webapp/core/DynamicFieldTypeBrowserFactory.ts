/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../../../../modules/base-components/webapp/core/IKIXObjectFactory';
import { DynamicFieldType } from '../../model/DynamicFieldType';

export class DynamicFieldTypeBrowserFactory implements IKIXObjectFactory<DynamicFieldType> {

    private static INSTANCE: DynamicFieldTypeBrowserFactory;

    public static getInstance(): DynamicFieldTypeBrowserFactory {
        if (!DynamicFieldTypeBrowserFactory.INSTANCE) {
            DynamicFieldTypeBrowserFactory.INSTANCE = new DynamicFieldTypeBrowserFactory();
        }
        return DynamicFieldTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(dynamicFieldType: DynamicFieldType): Promise<DynamicFieldType> {
        return new DynamicFieldType(dynamicFieldType);
    }

}
