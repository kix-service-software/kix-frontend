import { TranslationPattern } from "../../model";
import { IKIXObjectFactory } from "../kix";

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
