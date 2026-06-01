import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectSearch } from '../../model/ObjectSearch';

export class ObjectSearchRepository {

    private static INSTANCE: ObjectSearchRepository;

    public static getInstance(): ObjectSearchRepository {
        if (!ObjectSearchRepository.INSTANCE) {
            ObjectSearchRepository.INSTANCE = new ObjectSearchRepository();
        }
        return ObjectSearchRepository.INSTANCE;
    }

    private constructor() { }

    private db: IDBDatabase;

    public static readonly DB_NAME = 'kix-objectsearch';
    public static readonly STORE_NAME = 'objectsearch';

    public async initDatabase(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB?.open(ObjectSearchRepository.DB_NAME, 1);

            if (request) {
                request.onerror = (event: any): void => {
                    reject(event);
                };

                request.onsuccess = (event: any): void => {
                    this.db = event.target.result;
                    resolve();
                };

                request.onupgradeneeded = (event: any): void => {
                    this.db = event.target.result;
                    const objectStore = this.db?.createObjectStore(
                        ObjectSearchRepository.STORE_NAME,
                        {
                            keyPath: ['ObjectType', 'Property'],
                            autoIncrement: false
                        }
                    );
                    objectStore.createIndex('ObjectType', 'ObjectType', { unique: false });
                    objectStore.createIndex('Property', 'Property', { unique: false });
                    objectStore.createIndex('IsSortable', 'IsSortable', { unique: false });
                    objectStore.createIndex('IsSearchable', 'IsSearchable', { unique: false });
                    objectStore.createIndex('Operators', 'Operators', { unique: false });
                    objectStore.createIndex('ValueType', 'ValueType', { unique: false });
                };
            }
        });
    }

    public putObjectSearches(objectSearches: ObjectSearch[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db?.transaction([ObjectSearchRepository.STORE_NAME], 'readwrite');
            const objectStore = transaction?.objectStore(ObjectSearchRepository.STORE_NAME);

            for (const os of objectSearches) {
                objectStore?.put(os);
            }

            if (transaction) {
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

    public getObjectSearches(objectType: KIXObjectType | string): Promise<ObjectSearch[]> {
        return new Promise<ObjectSearch[]>((resolve, reject) => {

            const transaction = this.db?.transaction([ObjectSearchRepository.STORE_NAME], 'readonly');
            const objectStore = transaction?.objectStore(ObjectSearchRepository.STORE_NAME);

            const getAllRequest = objectStore?.index('ObjectType').getAll(objectType);

            if (getAllRequest) {
                getAllRequest.onsuccess = (): void => {
                    resolve(getAllRequest.result || []);
                };

                getAllRequest.onerror = (e): void => {
                    reject(e);
                };

                transaction.onerror = (e): void => {
                    reject(e);
                };
            } else {
                resolve([]);
            }

            transaction?.commit();

        });
    }

}