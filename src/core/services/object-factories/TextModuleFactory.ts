import { ObjectFactory } from "./ObjectFactory";
import { TextModule, KIXObjectType } from "../../model";

export class TextModuleFactory extends ObjectFactory<TextModule> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TEXT_MODULE;
    }

    public create(textModule?: TextModule): TextModule {
        return new TextModule(textModule);
    }

}
