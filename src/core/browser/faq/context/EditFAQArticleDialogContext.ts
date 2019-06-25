import { Context } from "../../../model/components/context/Context";
import { KIXObject, KIXObjectType, KIXObjectLoadingOptions } from "../../../model";
import { KIXObjectService } from "../../kix";

export class EditFAQArticleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-contact-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null,
                ['Attachments', 'Links'],
                ['Links']
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
