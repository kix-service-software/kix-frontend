import { CreateGroup } from './CreateGroup';

export class CreateGroupRequest {

    public Group: CreateGroup;

    public constructor(createGroup: CreateGroup) {
        this.Group = createGroup;
    }

}
