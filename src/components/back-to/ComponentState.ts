import { ContextHistoryEntry } from "../../core/browser/context/ContextHistoryEntry";

export class ComponentState {

    public constructor(
        public minimized: boolean = true,
        public history: ContextHistoryEntry[] = [],
        public keepShow: boolean = true
    ) { }

}
