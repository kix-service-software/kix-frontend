import { IdService } from '../../../../model/IdService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { Translation } from '../../model/Translation';
import { TranslationService } from './TranslationService';

export class TranslationRepository {

    private static INSTANCE: TranslationRepository;

    public static getInstance(): TranslationRepository {
        if (!TranslationRepository.INSTANCE) {
            TranslationRepository.INSTANCE = new TranslationRepository();
        }
        return TranslationRepository.INSTANCE;
    }

    private constructor() { }

    private db: IDBDatabase;

    private eventSubscriberId: string = IdService.generateDateBasedId();

    public static readonly DB_NAME = 'kix-i18n';
    public static readonly STORE_NAME = 'i18n';

    // eslint-disable-next-line max-lines-per-function
    public async initDatabase(): Promise<void> {

        EventService.getInstance().subscribe(ApplicationEvent.CACHE_KEYS_DELETED, {
            eventSubscriberId: this.eventSubscriberId,
            eventPublished: this.cacheChanged.bind(this)
        });

        EventService.getInstance().subscribe(ApplicationEvent.CACHE_CLEARED, {
            eventSubscriberId: this.eventSubscriberId,
            eventPublished: this.cacheChanged.bind(this)
        });

        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(TranslationRepository.DB_NAME, 1);

            if (request) {
                request.onerror = (event: any): void => {
                    reject(event);
                };

                request.onsuccess = async (event: any): Promise<void> => {
                    this.db = event.target.result;
                    await this.loadTranslations();
                    resolve();
                };

                request.onupgradeneeded = (event: any): void => {
                    this.db = event.target.result;
                    const objectStore = this.db?.createObjectStore(
                        TranslationRepository.STORE_NAME,
                        {
                            keyPath: ['Pattern', 'Language'],
                            autoIncrement: false
                        }
                    );
                    objectStore.createIndex('Pattern', 'Pattern', { unique: false });
                    objectStore.createIndex('Language', 'Language', { unique: false });
                    objectStore.createIndex('Value', 'Value', { unique: false });
                };
            }
        });
    }

    public putTranslations(translations: Translation[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db?.transaction([TranslationRepository.STORE_NAME], 'readwrite');
            const objectStore = transaction?.objectStore(TranslationRepository.STORE_NAME);

            if (objectStore && transaction) {
                for (const tx of translations) {
                    for (const lang in tx.Languages) {
                        if (tx.Languages[lang]) {
                            objectStore?.put({
                                Pattern: tx.Pattern,
                                Language: lang,
                                Value: tx.Languages[lang]
                            });
                        }
                    }
                }

                transaction.oncomplete = (): void => {
                    resolve();
                };

                transaction.onerror = (e): void => {
                    reject(e);
                };

                transaction.commit();
            }
        });
    }

    public getTranslation(pattern: string, language: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            if (!language) {
                resolve(pattern);
                return;
            }

            const transaction = this.db?.transaction([TranslationRepository.STORE_NAME], 'readonly');
            const objectStore = transaction?.objectStore(TranslationRepository.STORE_NAME);

            const getAllRequest = objectStore?.index('Pattern').getAll(pattern);

            if (getAllRequest) {
                getAllRequest.onsuccess = (): void => {
                    const translation = getAllRequest.result?.find((r) => r.Language === language);
                    resolve(translation?.Value || pattern);
                };

                getAllRequest.onerror = (e): void => {
                    reject(e);
                };

                transaction.onerror = (e): void => {
                    reject(e);
                };
            } else {
                resolve(pattern);
            }

            transaction?.commit();

        });
    }

    private clear(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db?.transaction([TranslationRepository.STORE_NAME], 'readwrite');
            const objectStore = transaction?.objectStore(TranslationRepository.STORE_NAME);

            const clearRequest = objectStore?.clear();

            if (clearRequest) {
                clearRequest.onsuccess = (): void => {
                    resolve();
                };

                clearRequest.onerror = (e): void => {
                    reject(e);
                };
            } else {
                resolve();
            }
        });

    }
    private async cacheChanged(data: string[], eventId: string): Promise<void> {
        if (eventId === ApplicationEvent.CACHE_KEYS_DELETED) {
            if (data.some((d) => d === KIXObjectType.TRANSLATION)) {
                TranslationRepository.getInstance().clear().then(() => this.loadTranslations());
            }
        } else if (eventId === ApplicationEvent.CACHE_CLEARED) {
            TranslationRepository.getInstance().clear().then(() => this.loadTranslations());
        }
    }

    private async loadTranslations(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions([], null, 0);
        const translations = await TranslationService.getInstance().loadObjects<Translation>(
            KIXObjectType.TRANSLATION, null, loadingOptions
        );
        await this.putTranslations(translations);
    }

}