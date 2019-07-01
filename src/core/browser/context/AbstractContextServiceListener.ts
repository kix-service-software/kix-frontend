import { IContextServiceListener } from "./IContextServiceListener";
import { Context, ContextDescriptor } from "../../model";

export abstract class AbstractContextServiceListener implements IContextServiceListener {

    public contextChanged(contextId: string, context: Context): void {
        // do nothing
    }

    public contextRegistered(descriptor: ContextDescriptor): void {
        // do nothing
    }

}
