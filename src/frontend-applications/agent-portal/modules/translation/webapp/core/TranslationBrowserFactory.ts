/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../../../../modules/base-components/webapp/core/IKIXObjectFactory';
import { Translation } from '../../model/Translation';

export class TranslationBrowserFactory implements IKIXObjectFactory<Translation> {

    private static INSTANCE: TranslationBrowserFactory;

    public static getInstance(): TranslationBrowserFactory {
        if (!TranslationBrowserFactory.INSTANCE) {
            TranslationBrowserFactory.INSTANCE = new TranslationBrowserFactory();
        }
        return TranslationBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(translation: Translation): Promise<Translation> {
        return new Translation(translation);
    }

}
