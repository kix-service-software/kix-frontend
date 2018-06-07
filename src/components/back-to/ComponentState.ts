import { ContextHistoryEntry } from "../../../../core/dist/browser/context/ContextHistoryEntry";

export class ComponentState {

    public constructor(
        public minimized: boolean = true,
        public history: ContextHistoryEntry[] = []
    ) { }

}
