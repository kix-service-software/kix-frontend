import { ConfiguredWidget } from "../../../core/model";

export class ComponentState {

    public constructor(
        public contentWidgets: ConfiguredWidget[] = [],
        public kixVersion: string = ''
    ) { }

}
