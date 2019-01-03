import { DisplayImageDescription } from "../../../../core/browser/components/DisplayImageDescription";

export class ComponentState {

    public constructor(
        public show: boolean = false,
        public image: DisplayImageDescription = null,
        public imageDescriptions: DisplayImageDescription[] = []
    ) { }

}
