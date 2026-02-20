import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { BackendNotification } from '../../../model/BackendNotification';
import { BackendNotificationEvent } from '../../../model/BackendNotificationEvent';
import { IdService } from '../../../model/IdService';
import { SearchCache } from '../../../modules/search/model/SearchCache';
import { User } from '../../../modules/user/model/User';
import { UserService } from '../../../modules/user/server/UserService';
import { ClientNotificationService } from '../../services/ClientNotificationService';

export class SearchRepository {

    public static saveUserSearchAsDefault(search: SearchCache, user: User): void {
        const fileName = `${user.UserID}_default_search.json`;
        const defaultSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = defaultSearches.findIndex((ss) => ss.objectType === search.objectType);
        if (searchIndex !== -1) {
            defaultSearches.splice(searchIndex, 1);
        }

        delete search.result;
        delete search['originalCriteria'];

        defaultSearches.push(search);
        ConfigurationService.getInstance().saveDataFileContent(fileName, defaultSearches);
    }

    public static async saveUserSearch(search: SearchCache, share: boolean, token: string): Promise<void> {
        const user = await UserService.getInstance().getUserByToken(token)
            .catch((): User => null);

        if (!search.id) {
            search.id = IdService.generateDateBasedId('SearchCache');
        }

        delete search['originalCriteria'];

        if (share) {
            await this.deleteUserSearch(search.id, token);
            await this.shareSearchCache(search, user);
        } else {
            await this.deleteSharedSearch(search.id);
            const preferenceId = ConfigurationService.getEnvString('NOTIFICATION_CLIENT_ID') + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);
            let searchConfig = {};

            if (searchPreference) {
                searchConfig = JSON.parse(searchPreference.Value);
                delete searchConfig[search.id];
            }

            delete search.userId;
            delete search.userDisplayText;
            searchConfig[search.id] = search;

            const value = JSON.stringify(searchConfig);
            await UserService.getInstance().setPreferences(token, 'SearchNamespace', [[preferenceId, value]]);
        }

        const event = new BackendNotification();
        event.ObjectID = 'SharedSearch';
        event.Namespace = 'Search.Shared';
        event.Event = BackendNotificationEvent.UPDATE;
        ClientNotificationService.getInstance().queueNotifications([event]);
    }

    public static loadUserSearchDefault(objectType: string, user: User): SearchCache {
        const fileName = `${user.UserID}_default_search.json`;
        const defaultSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];
        return defaultSearches.find((ds) => ds.objectType === objectType);
    }

    private static shareSearchCache(search: SearchCache, user: User): void {
        const fileName = 'shared_searches.json';
        const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = sharedSearches.findIndex((ss) => ss.id === search.id);
        if (searchIndex !== -1) {
            const existingSearch = sharedSearches[searchIndex];

            if (existingSearch?.userId !== user.UserID) {
                // do not overwrite a search from another user
                return;
            }

            sharedSearches.splice(searchIndex, 1);
        }

        search.userId = user.UserID;
        search.userDisplayText = user.UserLogin;
        sharedSearches.push(search);

        ConfigurationService.getInstance().saveDataFileContent(fileName, sharedSearches);
    }

    public static async deleteUserSearch(id: string, token: string): Promise<void> {
        const user = await UserService.getInstance().getUserByToken(token);
        if (user) {
            const preferenceId = ConfigurationService.getEnvString('NOTIFICATION_CLIENT_ID') + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);

            if (searchPreference) {
                const search = JSON.parse(searchPreference.Value);
                if (id && search[id]) {
                    delete search[id];
                    const value = JSON.stringify(search);
                    await UserService.getInstance().setPreferences(token, 'SearchNamespace', [[preferenceId, value]]);
                }
            }
        }
    }

    public static deleteSharedSearch(id: string): void {
        const fileName = 'shared_searches.json';
        const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = sharedSearches.findIndex((ss) => ss.id === id);
        if (searchIndex !== -1) {
            sharedSearches.splice(searchIndex, 1);
        }

        ConfigurationService.getInstance().saveDataFileContent(fileName, sharedSearches);
    }

    public static deleteDefault(objectType: string, user: User): void {
        const fileName = `${user.UserID}_default_search.json`;
        const defaultSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = defaultSearches.findIndex((ss) => ss.objectType === objectType);
        if (searchIndex !== -1) {
            defaultSearches.splice(searchIndex, 1);
        }

        ConfigurationService.getInstance().saveDataFileContent(fileName, defaultSearches);
    }
}