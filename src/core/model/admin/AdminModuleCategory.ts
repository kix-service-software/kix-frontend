import { ObjectIcon } from "../kix";
import { AdminModule } from "./AdminModule";

export class AdminModuleCategory {

    public constructor(
        category?: AdminModuleCategory,
        public id?: string,
        public name?: string,
        public icon?: string | ObjectIcon,
        public children?: AdminModuleCategory[],
        public modules?: AdminModule[]
    ) {
        if (category) {
            this.id = category.id;
            this.name = category.name;
            this.icon = category.icon;
            this.children = category.children.map((c) => new AdminModuleCategory(c));
            this.modules = category.modules.map((m) => new AdminModule(m));
        }
    }

}
