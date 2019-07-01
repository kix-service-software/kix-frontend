import { ContextType, Context, ContextDescriptor } from "../../model";

export interface IContextServiceListener {

    contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): void;

    contextRegistered(descriptor: ContextDescriptor): void;

}
