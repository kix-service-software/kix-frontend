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
