import { Permission } from "./Permission";

export class Permissions {

    public constructor(
        public Assigned: Permission[] = [],
        public DependingObjects: Permission[] = []
    ) { }

}
