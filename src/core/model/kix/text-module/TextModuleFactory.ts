import { IObjectFactory } from "../IObjectFactory";
import { TextModule } from "./TextModule";
import { KIXObjectType } from "../KIXObjectType";

export class TextModuleFactory implements IObjectFactory<TextModule> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TEXT_MODULE;
    }

    public create(textModule?: TextModule): TextModule {
        return new TextModule(textModule);
    }

}
