/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { BrowserCacheService } from '../webapp/core/CacheService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { BackendNotification } from '../../../model/BackendNotification';
import { RequestMethod } from '../../../../../server/model/rest/RequestMethod';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('BrowserCacheService', () => {

    describe('Get cached object', () => {

        before(async () => {
            await BrowserCacheService.getInstance().set('test-object', { data: 'test' });
        });

        after(() => {
            (BrowserCacheService.getInstance() as any).clear();
        });

        it('should get an cached object from the cache', async () => {
            const object = await BrowserCacheService.getInstance().get('test-object');
            expect(object).exist;
            expect(object.data).exist;
            expect(object.data).equals('test');
        });

    });

    describe('Delete cached object', () => {

        before(async () => {
            await BrowserCacheService.getInstance().set('test-object1', { data: 'test' }, 'TestKey');
            await BrowserCacheService.getInstance().set('test-object2', { data: 'test' }, 'TestKey');
            await BrowserCacheService.getInstance().set('test-object3', { data: 'test' }, 'TestKey');
            await BrowserCacheService.getInstance().set('test-object4', { data: 'test' }, 'TestKey');
        });

        after(() => {
            (BrowserCacheService.getInstance() as any).clear();
        });

        it('should delete an cached object', async () => {
            BrowserCacheService.getInstance().delete('test-object3', null);
            const hasKey = await BrowserCacheService.getInstance().has('test-object3');
            expect(hasKey).false;
        });

    });

    describe('Delete cached objects for key prefix', () => {

        before(async () => {
            await BrowserCacheService.getInstance().set('test-object1', { data: 'test' }, 'TestKey1');
            await BrowserCacheService.getInstance().set('test-object2', { data: 'test' }, 'TestKey1');
            await BrowserCacheService.getInstance().set('test-object3', { data: 'test' }, 'TestKey2');
            await BrowserCacheService.getInstance().set('test-object4', { data: 'test' }, 'TestKey2');
        });

        after(() => {
            (BrowserCacheService.getInstance() as any).clear();
        });

        it('should delete an cached object', async () => {
            BrowserCacheService.getInstance().deleteKeys('TestKey1');

            const hasKey1 = await BrowserCacheService.getInstance().has('test-object1');
            expect(hasKey1).false;

            const hasKey2 = await BrowserCacheService.getInstance().has('test-object2');
            expect(hasKey2).false;

            const hasKey3 = await BrowserCacheService.getInstance().has('test-object3');
            expect(hasKey3).true;

            const hasKey4 = await BrowserCacheService.getInstance().has('test-object4');
            expect(hasKey4).true;
        });

    });

    describe('Get correct cache key prefix for namespace (cache dependencies)', () => {

        describe('CMDB Namespace', () => {

            it('should resolve the namespace for CMDB.ConfigItem', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('CMDB.ConfigItem');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM_CLASS)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH_INSTANCE)).exist;
            });

            it('should resolve the namespace for CMDB.ConfigItemVersion', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('CMDB.ConfigItemVersion');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(6);

                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM_VERSION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH_INSTANCE)).exist;
            });

            it('should resolve the namespace for CMDB.Class', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('CMDB.Class');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(2);

                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM_CLASS)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

            it('should resolve the namespace for CMDB.Definition', () => {
                const prefixes: Array<KIXObjectType | string> = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('CMDB.Definition');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM_CLASS)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH_INSTANCE)).exist;
            });

        });

        describe('FAQ Namespace', () => {

            it('should resolve the namespace for FAQ.FAQArticle', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('FAQ.FAQArticle');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.FAQ_ARTICLE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.FAQ_CATEGORY)).exist;
            });

            it('should resolve the namespace for FAQ.FAQVote', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('FAQ.FAQVote');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.FAQ_ARTICLE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.FAQ_VOTE)).exist;
            });

            it('should resolve the namespace for FAQ.FAQCategory', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('FAQ.FAQCategory');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.FAQ_CATEGORY)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

        });

        describe('Ticket Namespace', () => {

            it('should resolve the namespace for State', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('State');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET_STATE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

            it('should resolve the namespace for Type', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('Type');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET_TYPE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

            it('should resolve the namespace for Queue', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.QUEUE);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.QUEUE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

            it('should resolve the namespace for Priority', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.TICKET_PRIORITY);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET_PRIORITY)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

            it('should resolve the namespace for Ticket', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.TICKET);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(9);

                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.ORGANISATION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONTACT)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.QUEUE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CURRENT_USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.ARTICLE)).exist;
                expect(prefixes.find((p) => p === 'OPTION_REQUEST')).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET_HISTORY)).exist;
            });

            it('should resolve the namespace for Article', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.ARTICLE);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.ARTICLE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CURRENT_USER)).exist;
            });

            it('should resolve the namespace for Watcher', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.WATCHER);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.WATCHER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CURRENT_USER)).exist;

            });

        });

        describe('Link Namespace', () => {

            it('should resolve the namespace for Link', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.LINK);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(8);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.FAQ_ARTICLE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.LINK)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.LINK_OBJECT)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH_INSTANCE)).exist;
            });

            it('should resolve the namespace for LINK_OBJECT', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.LINK_OBJECT);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(8);

                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONFIG_ITEM)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.FAQ_ARTICLE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.LINK)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.LINK_OBJECT)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GRAPH_INSTANCE)).exist;
            });
        });

        describe('Translation Namespace', () => {

            it('should resolve the namespace for Translation', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.TRANSLATION);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION_LANGUAGE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION_PATTERN)).exist;
            });

            it('should resolve the namespace for TranslationLanguage', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.TRANSLATION_LANGUAGE);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION_LANGUAGE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION_PATTERN)).exist;
            });

            it('should resolve the namespace for TranslationPattern', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.TRANSLATION_PATTERN);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION_LANGUAGE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TRANSLATION_PATTERN)).exist;
            });

        });

        describe('General Catalog Namespace', () => {

            it('should resolve the namespace for GeneralCatalogItem', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.GENERAL_CATALOG_ITEM);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.GENERAL_CATALOG_ITEM)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.GENERAL_CATALOG_CLASS)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

        });

        describe('Sysconfig Namespace', () => {

            it('should resolve the namespace for SysconfigOption', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.SYS_CONFIG_OPTION);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.SYS_CONFIG_OPTION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.REPORT_DEFINITION)).exist;
            });

            it('should resolve the namespace for SysconfigOptionDefinition', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(3);

                expect(prefixes.find((p) => p === KIXObjectType.SYS_CONFIG_OPTION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION)).exist;
            });

        });

        describe('Contact Namespace', () => {

            it('should resolve the namespace for Contact', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.CONTACT);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(6);

                expect(prefixes.find((p) => p === KIXObjectType.CONTACT)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.ORGANISATION)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.TICKET)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.OBJECT_ICON)).exist;
            });

        });

        describe('User Namespace', () => {

            it('should resolve the namespace for User', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.USER);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.ROLE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONTACT)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.REPORT_DEFINITION)).exist;
            });

        });

        describe('Personal Settings Namespace', () => {

            it('should resolve the namespace for PersonalSettings', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.PERSONAL_SETTINGS);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CURRENT_USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.PERSONAL_SETTINGS)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONTACT)).exist;
            });

            it('should resolve the namespace for UserPreferences', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.USER_PREFERENCE);
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(4);

                expect(prefixes.find((p) => p === KIXObjectType.USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CURRENT_USER)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.USER_PREFERENCE)).exist;
                expect(prefixes.find((p) => p === KIXObjectType.CONTACT)).exist;
            });

        });

        describe('Role/Permission Settings Namespace', () => {

            it('should clear the cache for Role', () => {
                (BrowserCacheService.getInstance() as any).clear = () => {
                    expect(true).true;
                };

                (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.ROLE);
            });

            it('should clear the cache for Permission', () => {
                (BrowserCacheService.getInstance() as any).clear = () => {
                    expect(true).true;
                };
                (BrowserCacheService.getInstance() as any).getCacheKeyPrefix(KIXObjectType.PERMISSION);
            });
        });

        describe('Handle Unknown Namespace', () => {

            it('should resolve the namespace for unknown', () => {
                const prefixes: string[] = (BrowserCacheService.getInstance() as any).getCacheKeyPrefix('Unknown.TestNamespace');
                expect(prefixes).exist;
                expect(prefixes).an('array');
                expect(prefixes.length).equals(1);

                expect(prefixes.find((p) => p === 'Unknown')).exist;
            });

        });

    });

    describe('Update Caches', () => {

        before(async () => {
            await BrowserCacheService.getInstance().set('test-object1', { data: 'test' }, 'TestKey1');
            await BrowserCacheService.getInstance().set('test-object2', { data: 'test' }, 'TestKey1');
            await BrowserCacheService.getInstance().set('test-object3', { data: 'test' }, 'TestKey2');
            await BrowserCacheService.getInstance().set('test-object4', { data: 'test' }, 'TestKey2');
        });

        after(() => {
            (BrowserCacheService.getInstance() as any).clear();
        });

        it('should delete the keys for the events', async () => {
            const data = new BackendNotification();
            data.Namespace = 'TestKey1';
            data.RequestID = 'testrequest';

            await BrowserCacheService.getInstance().updateCaches([data]);

            const hasKey1 = await BrowserCacheService.getInstance().has('test-object1');
            expect(hasKey1).false;

            const hasKey2 = await BrowserCacheService.getInstance().has('test-object2');
            expect(hasKey2).false;

            const hasKey3 = await BrowserCacheService.getInstance().has('test-object3');
            expect(hasKey3).true;

            const hasKey4 = await BrowserCacheService.getInstance().has('test-object4');
            expect(hasKey4).true;
        });
    });

});