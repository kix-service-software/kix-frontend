import { ObjectService } from './ObjectService';
import { ITextModuleService } from '@kix/core/dist/services';
import { TextModule, SortOrder } from '@kix/core/dist/model';
import {
    CreateTextModule,
    CreateTextModuleResponse,
    CreateTextModuleRequest,
    TextModulesResponse,
    TextModuleResponse,
    TextModuleCategoriesResponse,
    UpdateTextModule,
    UpdateTextModuleResponse,
    UpdateTextModuleRequest
} from '@kix/core/dist/api';

export class TextModuleService extends ObjectService<TextModule> implements ITextModuleService {

    protected RESOURCE_URI: string = "textmodules";

    public async getTextModules(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TextModule[]> {

        const response = await this.getObjects<TextModulesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.TextModule;
    }

    public async getTextModule(token: string, textModuleId: number, query?: any): Promise<TextModule> {
        const response = await this.getObject<TextModuleResponse>(
            token, textModuleId
        );

        return response.TextModule;
    }

    public async getTextModulesCategories(token: string): Promise<string[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'categories');
        const response = await this.httpService.get<TextModuleCategoriesResponse>(uri, {}, token);
        return response ? response.TextModuleCategory : [];
    }

    public async createTextModule(token: string, createTextModule: CreateTextModule): Promise<number> {
        const response = await this.createObject<CreateTextModuleResponse, CreateTextModuleRequest>(
            token, this.RESOURCE_URI, new CreateTextModuleRequest(createTextModule)
        );

        return response.TextModuleID;
    }

    public async updateTextModule(
        token: string, textModuleId: number, updateTextModule: UpdateTextModule
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, textModuleId);
        const response = await this.updateObject<UpdateTextModuleResponse, UpdateTextModuleRequest>(
            token, uri, new UpdateTextModuleRequest(updateTextModule)
        );

        return response.TextModuleID;
    }

    public async deleteTextModule(token: string, textModuleId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, textModuleId);
        await this.deleteObject<void>(token, uri);
    }

}
