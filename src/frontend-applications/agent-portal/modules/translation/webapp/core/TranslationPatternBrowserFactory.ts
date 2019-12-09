/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { TranslationPattern } from "../../model/TranslationPattern";

export class TranslationPatternBrowserFactory implements IKIXObjectFactory<TranslationPattern> {

    private static INSTANCE: TranslationPatternBrowserFactory;

    public static getInstance(): TranslationPatternBrowserFactory {
        if (!TranslationPatternBrowserFactory.INSTANCE) {
            TranslationPatternBrowserFactory.INSTANCE = new TranslationPatternBrowserFactory();
        }
        return TranslationPatternBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(translation: TranslationPattern): Promise<TranslationPattern> {
        return new TranslationPattern(translation);
    }

}
