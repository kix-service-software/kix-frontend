import { Context } from "../../../../../model/components/context/Context";
import {
    ContextDescriptor, ContextConfiguration, KIXObject, KIXObjectType,
    KIXObjectLoadingOptions, TranslationPatternProperty, TranslationPattern
} from "../../../../../model";
import { KIXObjectService } from "../../../../kix";

export class EditTranslationDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-translation-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN
    ): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.TRANSLATION_PATTERN) {
            const patternId = this.getObjectId();
            if (patternId) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, null,
                    [TranslationPatternProperty.LANGUAGES]
                );
                const objects = await KIXObjectService.loadObjects<TranslationPattern>(
                    KIXObjectType.TRANSLATION_PATTERN, [patternId], loadingOptions
                );
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }
}
