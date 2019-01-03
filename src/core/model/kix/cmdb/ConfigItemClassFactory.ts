import { ConfigItemClass } from "./ConfigItemClass";

export class ConfigItemClassFactory {

    public static create(_configItemClass: ConfigItemClass): ConfigItemClass {
        const configItemClass = new ConfigItemClass(_configItemClass);
        return configItemClass;
    }

}
