/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../kix';
import { ValidObject } from '../../model';

export class ValidObjectBrowserFactory implements IKIXObjectFactory<ValidObject> {

    private static INSTANCE: ValidObjectBrowserFactory;

    public static getInstance(): ValidObjectBrowserFactory {
        if (!ValidObjectBrowserFactory.INSTANCE) {
            ValidObjectBrowserFactory.INSTANCE = new ValidObjectBrowserFactory();
        }
        return ValidObjectBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(validObject: ValidObject): Promise<ValidObject> {
        const newValidObject = new ValidObject(validObject);
        return newValidObject;
    }

}
