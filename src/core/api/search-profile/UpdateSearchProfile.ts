import { RequestObject } from '../RequestObject';

export class UpdateSearchProfile extends RequestObject {

    public constructor(
        name: string = null,
        data: any = null,
        categories: string[] = null
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Data", data);
        this.applyProperty("Categories", categories);
    }

}
