import { IKIXObjectFactory } from '../kix';
import { TextModule } from '../../model';

export class TextModuleBrowserFactory implements IKIXObjectFactory<TextModule> {

    private static INSTANCE: TextModuleBrowserFactory;

    public static getInstance(): TextModuleBrowserFactory {
        if (!TextModuleBrowserFactory.INSTANCE) {
            TextModuleBrowserFactory.INSTANCE = new TextModuleBrowserFactory();
        }
        return TextModuleBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(textModule: TextModule): Promise<TextModule> {
        const newTextModule = new TextModule(textModule);
        return newTextModule;
    }

}
