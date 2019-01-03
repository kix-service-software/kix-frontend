import { ContextHistoryEntry } from "./ContextHistoryEntry";
import { Context } from "../../model";

export class ContextHistory {

    private static INSTANCE: ContextHistory;

    public static getInstance(): ContextHistory {
        if (!ContextHistory.INSTANCE) {
            ContextHistory.INSTANCE = new ContextHistory();
        }
        return ContextHistory.INSTANCE;
    }

    private constructor() { }

    private contextHistory: ContextHistoryEntry[] = [];

    public async addHistoryEntry(context: Context): Promise<void> {
        if (context) {
            const entry = this.contextHistory.find(
                (he) => he.contextId === context.getDescriptor().contextId && he.objectId === context.getObjectId()
            );

            const displayText = await context.getDisplayText();

            if (entry) {
                entry.displayText = displayText;
                entry.lastVisitDate = new Date().getTime();
            } else {
                const newEntry = new ContextHistoryEntry(
                    context.getIcon(),
                    displayText,
                    context.getDescriptor().contextId,
                    context.getObjectId(),
                    context.getDescriptor(),
                    new Date().getTime()
                );
                this.contextHistory.push(newEntry);
            }
        }
    }

    public getHistory(limit: number = 10, currentContext: Context): ContextHistoryEntry[] {
        return this.contextHistory
            .filter((he) =>
                he.contextId !== currentContext.getDescriptor().contextId ||
                he.objectId !== currentContext.getObjectId()
            ).sort((a, b) => b.lastVisitDate - a.lastVisitDate)
            .slice(0, limit);
    }

}
