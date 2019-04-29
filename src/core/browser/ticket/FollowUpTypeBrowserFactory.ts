import { FollowUpType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class FollowUpTypeBrowserFactory implements IKIXObjectFactory<FollowUpType> {

    private static INSTANCE: FollowUpTypeBrowserFactory;

    public static getInstance(): FollowUpTypeBrowserFactory {
        if (!FollowUpTypeBrowserFactory.INSTANCE) {
            FollowUpTypeBrowserFactory.INSTANCE = new FollowUpTypeBrowserFactory();
        }
        return FollowUpTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(followUpType: FollowUpType): Promise<FollowUpType> {
        return new FollowUpType(followUpType);
    }

}
