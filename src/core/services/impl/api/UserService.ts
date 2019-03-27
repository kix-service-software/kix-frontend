import { UsersResponse, UserResponse, } from '../../../api';
import {
    User, KIXObjectType, Error, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    UserPreference, PreferencesLoadingOptions, KIXObjectSpecificCreateOptions, KIXObjectCache
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { UserPreferencesResponse, SetPreference, SetPreferenceResponse, SetPreferenceRequest } from '../../../api/user';
import { LoggingService } from '../LoggingService';
import { SetPreferenceOptions, UserCacheHandler } from '../../../model/kix/user';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class UserService extends KIXObjectService {

    private static INSTANCE: UserService;

    public static getInstance(): UserService {
        if (!UserService.INSTANCE) {
            UserService.INSTANCE = new UserService();
        }
        return UserService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
        KIXObjectCache.registerCacheHandler(new UserCacheHandler());
    }

    protected RESOURCE_URI: string = "users";
    private USER_RESOURCE_URI = "user";
    protected SUB_RESOURCE_URI: string = 'preferences';

    public kixObjectType: KIXObjectType = KIXObjectType.USER;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.USER
            || kixObjectType === KIXObjectType.USER_PREFERENCE;
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.USER) {
            objects = await this.getUsers(token, objectIds.map((id) => Number(id)), loadingOptions);
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            objects = await this.getPreferences(
                token, loadingOptions, objectLoadingOptions as PreferencesLoadingOptions
            );
        }

        return objects;
    }

    // FIXME: korrekt implementieren
    public async getUsers(
        token: string, objectIds?: number[], loadingOptions?: KIXObjectLoadingOptions
    ): Promise<User[]> {
        const query = { fields: 'User.UserLogin,User.UserID,User.UserFullname' };
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<UsersResponse>(token, uri, query);
        return response.User;
    }

    private async getPreferences(
        token: string, loadingOptions: KIXObjectLoadingOptions, preferenceLoadingOptions: PreferencesLoadingOptions
    ): Promise<UserPreference[]> {
        let preferences = [];
        const query = loadingOptions ? this.prepareQuery(loadingOptions) : null;
        if (preferenceLoadingOptions.userId) {

            const uri = this.buildUri(this.RESOURCE_URI, preferenceLoadingOptions.userId, this.SUB_RESOURCE_URI);
            const response = await this.getObjectByUri<UserPreferencesResponse>(token, uri, query);

            preferences = response.UserPreference.map((p) => new UserPreference(p));
        }
        return preferences;
    }

    public async getUserByToken(token: string, cache: boolean = true): Promise<User> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.CURRENT_USER) || !cache) {
            const query = {
                include: 'Tickets,Preferences'
            };

            const response = await this.httpService.get<UserResponse>(this.USER_RESOURCE_URI, query, token);

            KIXObjectCache.addObject(KIXObjectType.CURRENT_USER, new User(response.User));
        }

        return KIXObjectCache.getObjectCache<User>(KIXObjectType.CURRENT_USER)[0];
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.USER) {
            throw new Error('', "Method not implemented.");
        } else if (KIXObjectType.USER_PREFERENCE) {
            const options = createOptions as SetPreferenceOptions;
            const createPreference = new SetPreference(parameter);
            const response = await this.sendCreateRequest<SetPreferenceResponse, SetPreferenceRequest>(
                token,
                this.buildUri(this.RESOURCE_URI, options.userId, this.SUB_RESOURCE_URI),
                new SetPreferenceRequest(createPreference)
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            return response.UserPreferenceID;
        }
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string,
        updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.USER) {
            throw new Error('', "Method not implemented.");
        } else if (KIXObjectType.USER_PREFERENCE) {
            const options = updateOptions as SetPreferenceOptions;
            const updatePreference = new SetPreference(parameter);
            const response = await this.sendUpdateRequest<SetPreferenceResponse, SetPreferenceRequest>(
                token,
                this.buildUri(this.RESOURCE_URI, options.userId, this.SUB_RESOURCE_URI, objectId),
                new SetPreferenceRequest(updatePreference)
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            return response.UserPreferenceID;
        }
    }

    public async setPreferences(token: string, parameter: Array<[string, any]>, userId: number): Promise<void> {
        const currentPreferences = await this.getPreferences(token, null, new PreferencesLoadingOptions(userId));
        const errors: Error[] = [];
        for (const param of parameter) {
            if (currentPreferences.some((p) => p.ID === param[0])) {
                await this.updateObject(
                    token, KIXObjectType.USER_PREFERENCE,
                    [
                        ['Value', param[1]]
                    ],
                    param[0],
                    new SetPreferenceOptions(userId)
                ).catch((error: Error) => {
                    errors.push(error);
                });
            } else {
                await this.createObject(
                    token, KIXObjectType.USER_PREFERENCE,
                    [
                        ['ID', param[0]],
                        ['Value', param[1]]
                    ],
                    new SetPreferenceOptions(userId)
                ).catch((error: Error) => {
                    errors.push(error);
                });
            }
        }
        // TODO: für Komponente ggf. Fehlerliste übermitteln
        if (!!errors.length) {
            throw new Error(errors[0].Code, errors.map((e) => e.Message).join("\n"));
        }
    }

}
