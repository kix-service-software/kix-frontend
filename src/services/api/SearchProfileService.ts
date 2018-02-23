import { ObjectService } from './ObjectService';
import { ISearchProfileService } from '@kix/core/dist/services';
import { SearchProfile, SortOrder } from '@kix/core/dist/model';
import {
    CreateSearchProfile,
    CreateSearchProfileResponse,
    CreateSearchProfileRequest,
    SearchProfilesResponse,
    SearchProfileResponse,
    SearchProfileCategoriesResponse,
    UpdateSearchProfile,
    UpdateSearchProfileResponse,
    UpdateSearchProfileRequest
} from '@kix/core/dist/api';

export class SearchProfileService extends ObjectService<SearchProfile> implements ISearchProfileService {

    protected RESOURCE_URI: string = "searchprofiles";

    public async getSearchProfiles(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<SearchProfile[]> {

        const response = await this.getObjects<SearchProfilesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.SearchProfile;
    }

    public async getSearchProfile(token: string, searchProfileId: number, query?: any): Promise<SearchProfile> {
        const response = await this.getObject<SearchProfileResponse>(
            token, searchProfileId
        );

        return response.SearchProfile;
    }

    public async getSearchProfilesCategories(token: string): Promise<string[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'categories');
        const response = await this.httpService.get<SearchProfileCategoriesResponse>(uri, {}, token);
        return response ? response.SearchProfileCategory : [];
    }

    public async createSearchProfile(token: string, createSearchProfile: CreateSearchProfile): Promise<number> {
        const response = await this.createObject<CreateSearchProfileResponse, CreateSearchProfileRequest>(
            token, this.RESOURCE_URI, new CreateSearchProfileRequest(createSearchProfile)
        );

        return response.SearchProfileID;
    }

    public async updateSearchProfile(
        token: string, searchProfileId: number, updateSearchProfile: UpdateSearchProfile
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, searchProfileId);
        const response = await this.updateObject<UpdateSearchProfileResponse, UpdateSearchProfileRequest>(
            token, uri, new UpdateSearchProfileRequest(updateSearchProfile)
        );

        return response.SearchProfileID;
    }

    public async deleteSearchProfile(token: string, searchProfileId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, searchProfileId);
        await this.deleteObject<void>(token, uri);
    }

}
