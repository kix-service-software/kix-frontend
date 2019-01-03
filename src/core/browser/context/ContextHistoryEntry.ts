import { ObjectIcon, ContextDescriptor } from "../../model";

export class ContextHistoryEntry {

    public constructor(
        public icon: string | ObjectIcon,
        public displayText: string,
        public contextId: string,
        public objectId: string | number,
        public descriptor: ContextDescriptor,
        public lastVisitDate: number
    ) { }

}
