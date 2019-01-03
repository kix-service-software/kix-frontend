import { ConfigItemImage } from "./ConfigItemImage";

export class ConfigItemImageFactory {

    public static create(_configItemImage: ConfigItemImage): ConfigItemImage {
        const configItemImage = new ConfigItemImage(_configItemImage);
        return configItemImage;
    }

}
