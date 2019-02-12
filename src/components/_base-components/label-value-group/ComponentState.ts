import { LabelValueGroup } from "../../../core/model";

export class ComponentState {

    public constructor(
        public groups: LabelValueGroup[] = [],
        public level: number = 0
    ) { }
}
