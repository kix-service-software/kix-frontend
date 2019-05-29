import { IContextServiceListener } from "./IContextServiceListener";
import { Context } from "../../model";

export abstract class AbstractContextServiceListener implements IContextServiceListener {

    public contextChanged(contextId: string, context: Context): void {
        // do nothing
    }

}
