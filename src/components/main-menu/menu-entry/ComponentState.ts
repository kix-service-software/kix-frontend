import { MenuEntry } from "../../../core/model";

export class ComponentState {

    public constructor(
        public entry: MenuEntry = null,
        public show: boolean = false
    ) { }

}
