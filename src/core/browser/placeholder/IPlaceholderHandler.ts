import { KIXObject } from "../../model";

export interface IPlaceholderHandler {

    handlerId: string;

    isHandlerFor(objectString: string): boolean;

    replace(placeholder: string, object?: KIXObject, language?: string): Promise<string>;

}
