import { Permission } from "./Permission";

export class ConfiguredPermissions {

    public constructor(
        public Assigned: Permission[] = [],
        public DependingObjects: Permission[] = []
    ) { }

}
