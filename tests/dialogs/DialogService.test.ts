// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { KIXObjectType, ContextMode, ConfiguredDialogWidget, Context, ObjectIcon } from '../../src/core/model';
import { DialogService, IMainDialogListener, IOverlayDialogListener } from '../../src/core/browser';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Dialog Service Tests', () => {

    describe('Retrieve dialogs for specific context types.', () => {

        const createDialogsCount = 4;
        const editDialogsCount = 6;

        let dialogs = [];

        before(() => {
            dialogs = [...registerDialogs(ContextMode.EDIT, editDialogsCount)];
            dialogs = [...dialogs, ...registerDialogs(ContextMode.CREATE, createDialogsCount)];
        });

        it('Should retrieve edit dialogs.', () => {
            const dialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.EDIT);
            expect(dialogs).not.undefined;
            expect(dialogs).an('array');
            expect(dialogs.length).equals(editDialogsCount);
        });

        it('Should retrieve create dialogs.', () => {
            const dialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.CREATE);
            expect(dialogs).not.undefined;
            expect(dialogs).an('array');
            expect(dialogs.length).equals(createDialogsCount);
        });

        after(() => {
            unregisterDialogs(dialogs);
            const existingDialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.EDIT);
            expect(existingDialogs).an('array');
            expect(existingDialogs, 'Not all dialogs are unregistered').empty;
        });

    });

    describe('Retrieve dialogs for specific context types and KIXObjectType.', () => {

        let dialogs = [];

        before(() => {
            dialogs = [...registerDialogs(ContextMode.EDIT, 1, KIXObjectType.TICKET)];
            dialogs = [...dialogs, ...registerDialogs(ContextMode.EDIT, 1, KIXObjectType.CONFIG_ITEM)];
            dialogs = [...dialogs, ...registerDialogs(ContextMode.EDIT, 1, KIXObjectType.FAQ_ARTICLE)];

            dialogs = [...dialogs, ...registerDialogs(ContextMode.CREATE, 1, KIXObjectType.TICKET)];
            dialogs = [...dialogs, ...registerDialogs(ContextMode.CREATE, 1, KIXObjectType.TICKET)];
            dialogs = [...dialogs, ...registerDialogs(ContextMode.CREATE, 1, KIXObjectType.CONFIG_ITEM)];
            dialogs = [...dialogs, ...registerDialogs(ContextMode.CREATE, 1, KIXObjectType.FAQ_ARTICLE)];
        });

        it('Should retrieve edit dialogs for ticket.', () => {
            const dialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.EDIT, KIXObjectType.TICKET);
            expect(dialogs).not.undefined;
            expect(dialogs).an('array');
            expect(dialogs.length).equals(1);
            expect(dialogs[0].contextMode).equals(ContextMode.EDIT);
            expect(dialogs[0].kixObjectType).equals(KIXObjectType.TICKET);
        });

        it('Should retrieve multiple create dialogs for ticket.', () => {
            const dialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.CREATE, KIXObjectType.TICKET);
            expect(dialogs).not.undefined;
            expect(dialogs).an('array');
            expect(dialogs.length).equals(2);
            expect(dialogs[0].contextMode).equals(ContextMode.CREATE);
            expect(dialogs[0].kixObjectType).equals(KIXObjectType.TICKET);
        });

        after(() => {
            unregisterDialogs(dialogs);
            const existingDialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.EDIT);
            expect(existingDialogs).an('array');
            expect(existingDialogs, 'Not all dialogs are unregistered').empty;
        });

    });

    describe('Notify main dialog listeners.', () => {

        it('Should notify on submit.', () => {

            const listener: IMainDialogListener = {
                submit: (data: any) => {
                    expect(data).not.undefined;
                    expect(data.submit).not.undefined;
                    expect(data.submit).true;
                },
                close: () => { },
                open: () => { },
                setHint: () => { },
                setLoading: () => { },
                setTitle: () => { }
            }

            DialogService.getInstance().registerMainDialogListener(listener);
            DialogService.getInstance().submitMainDialog({ submit: true });
        });

        it('Should notify on close.', () => {

            const listener: IMainDialogListener = {
                submit: () => { },
                close: (data: any) => {
                    expect(data).not.undefined;
                    expect(data.close).not.undefined;
                    expect(data.close).true;
                },
                open: () => { },
                setHint: () => { },
                setLoading: () => { },
                setTitle: () => { }
            }

            DialogService.getInstance().registerMainDialogListener(listener);
            DialogService.getInstance().closeMainDialog({ close: true });
        });

        it('Should notify on open.', async () => {

            const listener: IMainDialogListener = {
                submit: () => { },
                close: () => { },
                open: (dialogTitle: string, dialogs: ConfiguredDialogWidget[], dialogId?: string, dialogIcon?: string | ObjectIcon) => {
                    expect(dialogTitle).equals(dialogTitle);
                    expect(dialogId).equals(dialogId);
                    expect(dialogIcon).equals('kix-dialog-icon');
                },
                setHint: () => { },
                setLoading: () => { },
                setTitle: () => { }
            }

            DialogService.getInstance().registerMainDialogListener(listener);
            await DialogService.getInstance().openMainDialog(ContextMode.CREATE, 'dialogId', KIXObjectType.TICKET, 'dialogTitle', 'kix-dialog-icon');
        });

        it('Should notify for new hint.', async () => {

            const listener: IMainDialogListener = {
                submit: () => { },
                close: () => { },
                open: () => { },
                setHint: (hint: string) => { expect(hint).equals('Hinttext'); },
                setLoading: () => { },
                setTitle: () => { }
            }

            DialogService.getInstance().registerMainDialogListener(listener);
            DialogService.getInstance().setMainDialogHint('Hinttext');
        });

        it('Should notify for loading.', async () => {

            const listener: IMainDialogListener = {
                submit: () => { },
                close: () => { },
                open: () => { },
                setHint: () => { },
                setLoading: (isLoading: boolean, loadingHint: string, showClose: boolean, time: number, cancelCallback: () => void) => {
                    expect(isLoading).true;
                    expect(loadingHint).equals('loadingHint');
                    expect(showClose).true;
                    expect(time).equals(1000);
                    expect(cancelCallback).not.undefined;

                },
                setTitle: () => { }
            }

            DialogService.getInstance().registerMainDialogListener(listener);
            DialogService.getInstance().setMainDialogLoading(true, 'loadingHint', true, 1000, () => { });
        });

        it('Should notify for new title.', async () => {

            const listener: IMainDialogListener = {
                submit: () => { },
                close: () => { },
                open: () => { },
                setHint: () => { },
                setLoading: () => { },
                setTitle: (title: string) => { expect(title).equals('dialogTitle'); }
            }

            DialogService.getInstance().registerMainDialogListener(listener);
            DialogService.getInstance().setMainDialogHint('dialogTitle');
        });

    });

    describe('Notify dialog result listeners.', () => {

        it('Should notify for new result.', () => {
            const listener = (result: any) => {
                expect(result).not.undefined;
                expect(result.result).not.undefined;
                expect(result.result).true;
            }

            DialogService.getInstance().registerDialogResultListener('test-result-listener', 'test', listener);
            DialogService.getInstance().publishDialogResult('test-result-listener', { result: true });
        });

    });

    describe('Notify overlay dialog listeners.', () => {

        it('Should notify on open.', () => {
            const listener: IOverlayDialogListener = {
                close: () => { },
                open: (dialogTagId: string, input?: any, title?: string, icon?: string | ObjectIcon) => {
                    expect(dialogTagId).equals('dialogId');
                    expect(input).not.undefined;
                    expect(input.input).not.undefined;
                    expect(input.input).true;
                    expect(title).equals('title');
                    expect(icon).equals('kix-icon');
                },
                setLoading: () => { }
            }

            DialogService.getInstance().registerOverlayDialogListener(listener);
            DialogService.getInstance().openOverlayDialog('dialogId', { input: true }, 'title', 'kix-icon');
        });

        it('Should notify on close.', () => {
            const listener: IOverlayDialogListener = {
                close: () => {
                    expect(true).true;
                },
                open: () => { },
                setLoading: () => { }
            }

            DialogService.getInstance().registerMainDialogListener({
                close: () => { }, open: () => { }, setHint: () => { }, setLoading: () => { }, setTitle: () => { }, submit: () => { }
            });
            DialogService.getInstance().registerOverlayDialogListener(listener);
            DialogService.getInstance().closeMainDialog();
        });

        it('Should notify on loading.', () => {
            const listener: IOverlayDialogListener = {
                close: () => { },
                open: () => { },
                setLoading: (loading: boolean) => {
                    expect(loading).true;
                }
            }

            DialogService.getInstance().registerOverlayDialogListener(listener);
            DialogService.getInstance().setOverlayDialogLoading(true);
        });

    });

    function registerDialogs(contextMode: ContextMode, count: number, kixObjectType: KIXObjectType = KIXObjectType.ANY): ConfiguredDialogWidget[] {
        const dialogs = [];
        for (let i = 0; i < count; i++) {
            const dialog = new ConfiguredDialogWidget(`${contextMode}-${i}-dialog`, null, kixObjectType, contextMode);
            DialogService.getInstance().registerDialog(dialog);
            dialogs.push(dialog);
        }
        return dialogs;
    }

    function unregisterDialogs(dialogs: ConfiguredDialogWidget[]): void {
        dialogs.forEach((d) => DialogService.getInstance().unregisterDialog(d.instanceId));
    }

});