import { ObjectData, Context, ContextConfiguration, ContextType } from "../../model";

export class ContextServiceState {

    public previousContextId: string = null;

    public contexts: Array<Context<ContextConfiguration>> = [];

    public activeContexts: Map<ContextType, Context<ContextConfiguration>> = new Map();

    public activeContextType: ContextType = ContextType.MAIN;

    public contextStack: string[] = [];

    public objectData: ObjectData = null;

}
