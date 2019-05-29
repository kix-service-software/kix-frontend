import { ObjectData, Context, ContextType } from "../../model";

export class ContextServiceState {

    public previousContextId: string = null;

    public contexts: Context[] = [];

    public activeContexts: Map<ContextType, Context> = new Map();

    public activeContextType: ContextType = ContextType.MAIN;

    public contextStack: string[] = [];

    public objectData: ObjectData = null;

}
