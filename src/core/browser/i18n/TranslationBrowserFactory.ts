import { Translation } from "../../model";
import { IKIXObjectFactory } from "../kix";

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
