import { ContextType, Context } from "../../model";

export interface IContextServiceListener {

    contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): void;

}
