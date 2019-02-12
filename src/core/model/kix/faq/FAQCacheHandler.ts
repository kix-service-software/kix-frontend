import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { KIXObjectType } from "../KIXObjectType";
import { ServiceMethod } from "../../../browser";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { CreateFAQVoteOptions } from "./CreateFAQVoteOptions";
import { KIXObjectCache } from "../../KIXObjectCache";

export class FAQCacheHandler implements IKIXObjectCacheHandler {

    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        if (objectType === KIXObjectType.FAQ_CATEGORY_HIERARCHY) {
            switch (method) {
                case ServiceMethod.CREATE:
                    KIXObjectCache.clearCache(objectType);
                default:
            }
        }
        if (objectType === KIXObjectType.FAQ_VOTE) {
            switch (method) {
                case ServiceMethod.CREATE:
                    const faqArticleId = options && (options instanceof CreateFAQVoteOptions)
                        ? (options as CreateFAQVoteOptions).faqArticleId
                        : null;
                    if (faqArticleId) {
                        KIXObjectCache.removeObject(KIXObjectType.FAQ_ARTICLE, Number(faqArticleId));
                    }
                    break;
                default:
            }
        }
        if (objectType === KIXObjectType.FAQ_ARTICLE) {
            switch (method) {
                case ServiceMethod.UPDATE:
                    KIXObjectCache.removeObject(KIXObjectType.FAQ_ARTICLE, objectId);
                    break;
                default:
            }
        }
    }

}
