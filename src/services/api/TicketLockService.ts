import { ObjectService } from './ObjectService';
import { ITicketLockService } from '@kix/core/dist/services';
import { Lock } from '@kix/core/dist/model';
import {
    LockResponse, LocksResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class TicketLockService extends ObjectService<Lock> implements ITicketLockService {

    protected RESOURCE_URI: string = "ticketlocks";

    public async getLocks(token: string, query?: any): Promise<Lock[]> {
        const response = await this.getObjects<LocksResponse>(token);
        return response.Lock;
    }

    public async getLock(token: string, lockId: number): Promise<Lock> {
        const response = await this.getObject<LockResponse>(token, lockId);
        return response.Lock;
    }

}
