import { UIComponentPermission } from "./UIComponentPermission";

export class UIComponent {

    public constructor(
        public tagId: string,
        public componentPath: string,
        public permissions: UIComponentPermission[]
    ) { }

}
