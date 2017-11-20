import { ObjectService } from './ObjectService';
import { ArticleType } from '@kix/core/dist/model';
import { IArticleTypeService } from '@kix/core/dist/services';
import { ArticleTypeResponse, ArticleTypesResponse, SortOrder } from '@kix/core/dist/api';

export class ArticleTypeService extends ObjectService<ArticleType> implements IArticleTypeService {

    protected RESOURCE_URI: string = "articletypes";

    public async getArticleTypes(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ArticleType[]> {

        const response = await this.getObjects<ArticleTypesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.ArticleType;

    }
    public async getArticleType(token: string, articleTypeId: number, query?: any): Promise<ArticleType> {
        const response = await this.getObject<ArticleTypeResponse>(
            token, articleTypeId
        );

        return response.ArticleType;
    }

}
