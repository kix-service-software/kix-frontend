import { ObjectService } from './ObjectService';
import { IGeneralCatalogService } from '@kix/core/dist/services';
import { GeneralCatalogItem, SortOrder } from '@kix/core/dist/model';
import { GeneralCatalogItemsResponse } from '@kix/core/dist/api';

export class GeneralCatalogService extends ObjectService<GeneralCatalogItem> implements IGeneralCatalogService {

    protected RESOURCE_URI: string = 'generalcatalog';

    public async getItems(token: string): Promise<GeneralCatalogItem[]> {

        const query = {
            filter: '{"GeneralCatalogItem": {"AND": [{"Field": "Class", "Operator": "EQ", '
                + '"Value": "DynamicField::DisplayGroup"}]}}',
        };

        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<GeneralCatalogItemsResponse>(
            token, uri, query
        );

        return response.GeneralCatalogItem;
    }

}
