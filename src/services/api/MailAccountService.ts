import { ObjectService } from './ObjectService';
import { IMailAccountService } from '@kix/core/dist/services';
import { MailAccount } from '@kix/core/dist/model';
import {
    CreateMailAccount,
    CreateMailAccountResponse,
    CreateMailAccountRequest,
    MailAccountsResponse,
    MailAccountResponse,
    MailAccountTypesResponse,
    UpdateMailAccount,
    UpdateMailAccountResponse,
    UpdateMailAccountRequest
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class MailAccountService extends ObjectService<MailAccount> implements IMailAccountService {

    protected RESOURCE_URI: string = "mailaccounts";

    public async getMailAccounts(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<MailAccount[]> {

        const response = await this.getObjects<MailAccountsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.MailAccount;
    }

    public async getMailAccount(token: string, mailAccountId: number, query?: any): Promise<MailAccount> {
        const response = await this.getObject<MailAccountResponse>(
            token, mailAccountId
        );

        return response.MailAccount;
    }

    public async getMailAccountTypes(token: string): Promise<string[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'types');
        const response = await this.getObjectByUri<MailAccountTypesResponse>(token, uri);

        return response.MailAccountType;
    }

    public async createMailAccount(token: string, createMailAccount: CreateMailAccount): Promise<number> {
        const response = await this.createObject<CreateMailAccountResponse, CreateMailAccountRequest>(
            token, this.RESOURCE_URI, new CreateMailAccountRequest(createMailAccount)
        );

        return response.MailAccountID;
    }

    public async updateMailAccount(
        token: string, mailAccountId: number, updateMailAccount: UpdateMailAccount
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, mailAccountId);
        const response = await this.updateObject<UpdateMailAccountResponse, UpdateMailAccountRequest>(
            token, uri, new UpdateMailAccountRequest(updateMailAccount)
        );

        return response.MailAccountID;
    }

    public async deleteMailAccount(token: string, mailAccountId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, mailAccountId);
        await this.deleteObject<void>(token, uri);
    }

}
