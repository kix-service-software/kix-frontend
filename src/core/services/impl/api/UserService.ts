import {
    User, KIXObjectType, Error, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    PreferencesLoadingOptions, KIXObjectSpecificCreateOptions
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { LoggingService } from '../LoggingService';
import { SetPreferenceOptions, UserPreference, UserProperty } from '../../../model/kix/user';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { UserFactory } from '../../object-factories/UserFactory';
import { UserPreferenceFactory } from '../../object-factories/UserPreferenceFactory';

export class UserService extends KIXObjectService {

    private static INSTANCE: UserService;

    public static getInstance(): UserService {
        if (!UserService.INSTANCE) {
            UserService.INSTANCE = new UserService();
        }
        return UserService.INSTANCE;
    }

    private constructor() {
        super([new UserFactory(), new UserPreferenceFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = "users";
    private USER_RESOURCE_URI = "user";
    protected SUB_RESOURCE_URI: string = 'preferences';

    public objectType: KIXObjectType = KIXObjectType.USER;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.USER
            || kixObjectType === KIXObjectType.USER_PREFERENCE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.USER) {
            objects = await super.load(
                token, KIXObjectType.USER, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.USER
            );
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            if ((objectLoadingOptions as PreferencesLoadingOptions).userId) {
                const uri = this.buildUri(
                    this.RESOURCE_URI, (objectLoadingOptions as PreferencesLoadingOptions).userId, this.SUB_RESOURCE_URI
                );
                objects = await super.load(
                    token, KIXObjectType.USER_PREFERENCE, uri, loadingOptions, objectIds, KIXObjectType.USER_PREFERENCE
                );
            }
        }

        return objects;
    }

    public async getUserByToken(token: string): Promise<User> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, ['Tickets', 'Preferences']);
        const users = await super.load<User>(
            token, KIXObjectType.USER, this.USER_RESOURCE_URI, loadingOptions, null, KIXObjectType.USER
        );

        return users && users.length ? users[0] : null;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.USER) {
            const createParameter = parameter.filter((p) => p[0] !== UserProperty.USER_LANGUAGE);
            const userLanguage = parameter.find((p) => p[0] === UserProperty.USER_LANGUAGE);
            if (userLanguage) {
                const preferences = [
                    {
                        ID: UserProperty.USER_LANGUAGE,
                        Value: userLanguage[1]
                    }
                ];
                createParameter.push([UserProperty.PREFERENCES, preferences]);
            }

            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, createParameter, this.RESOURCE_URI, this.objectType, 'UserID', true
            );

            return id;
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            const options = createOptions as SetPreferenceOptions;
            const uri = this.buildUri(this.RESOURCE_URI, options.userId, this.SUB_RESOURCE_URI);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, objectType, 'UserPreferenceID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            return id;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string,
        updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.USER) {
            const userPassword = this.getParameterValue(parameter, UserProperty.USER_PASSWORD);
            if (!userPassword || userPassword === '') {
                parameter = parameter.filter((p) => p[0] !== UserProperty.USER_PASSWORD);
            }

            const updateParameter = parameter.filter((p) =>
                p[0] !== UserProperty.USER_LANGUAGE &&
                p[0] !== UserProperty.ROLEIDS &&
                p[0] !== UserProperty.PREFERENCES
            );

            const userId = Number(objectId);

            const uri = this.buildUri(this.RESOURCE_URI, userId);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, updateParameter, uri, this.objectType, 'UserID'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const roleIds = this.getParameterValue(parameter, UserProperty.ROLEIDS);
            await this.updateUserRoles(token, clientRequestId, roleIds, userId);

            const userLanguage = parameter.find((p) => p[0] === UserProperty.USER_LANGUAGE);
            if (userLanguage) {
                await this.setPreferences(token, clientRequestId, [userLanguage], userId);
            }

            return id;
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            const options = updateOptions as SetPreferenceOptions;
            const uri = this.buildUri(this.RESOURCE_URI, options.userId, this.SUB_RESOURCE_URI, objectId);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, objectType, 'UserPreferenceID'
            );
            return id;
        }
    }

    private async updateUserRoles(
        token: string, clientReqeustId: string, roleIds: number[], userId: number
    ): Promise<void> {
        if (!roleIds) {
            roleIds = [];
        }

        const baseUri = this.buildUri(this.RESOURCE_URI, userId, 'roleids');
        const existingRoleIds = await this.load(token, null, baseUri, null, null, 'RoleIDs');

        const rolesToDelete = existingRoleIds.filter((r) => !roleIds.some((rid) => rid === r));
        const rolesToCreate = roleIds.filter((r) => !existingRoleIds.some((rid) => rid === r));

        for (const roleId of rolesToDelete) {
            const deleteUri = this.buildUri(baseUri, roleId);
            await this.sendDeleteRequest(token, clientReqeustId, deleteUri, KIXObjectType.USER)
                .catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }

        for (const roleId of rolesToCreate) {
            await this.sendCreateRequest(token, clientReqeustId, baseUri, { RoleID: roleId }, KIXObjectType.USER)
                .catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }

    }

    public async setPreferences(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, userId: number
    ): Promise<void> {
        const currentPreferences = await this.loadObjects<UserPreference>(
            token, null, KIXObjectType.USER_PREFERENCE, null, null, new PreferencesLoadingOptions(userId)
        );
        const errors: Error[] = [];
        for (const param of parameter) {
            if (currentPreferences.some((p) => p.ID === param[0])) {
                await this.updateObject(
                    token, clientRequestId, KIXObjectType.USER_PREFERENCE,
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
                    token, clientRequestId, KIXObjectType.USER_PREFERENCE,
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
