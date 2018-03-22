/* tslint:disable*/
import { container } from './../../src/Container';

import { ITranslationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Translation Service', () => {
    let translationService: ITranslationService;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        translationService = container.getDIContainer().get<ITranslationService>("ITranslationService");

        (translationService as any).translationConfiguration = {
            translations: [
                {
                    id: "TEST:TRANSLATION",
                    defaultValue: "DEFAULT VALUE",
                    translationValues: {
                        en: "TRANSLATED",
                        de: "UEBERSETZT"
                    }
                },
                {
                    id: "TEST:TRANSLATION1",
                    defaultValue: "DEFAULT VALUE1",
                    translationValues: {
                        en: "TRANSLATED1"
                    }
                }
            ]
        }
    });

    it('service instance is registered in container.', () => {
        expect(translationService).not.undefined;
    });

    describe('Request a existing translation', () => {

        it('should return the correct translation', () => {
            const translation = translationService.getTranslation("TEST:TRANSLATION", "en");
            expect(translation).equals("TRANSLATED");
        });

    });

    describe('Request a not existing translations', () => {

        it("should return the requested id as value if the id not exists", () => {
            const translation = translationService.getTranslation("NOT:EXISTING", "de");
            expect(translation).equals("NOT:EXISTING");
        });

        it("should return the default value if the language does not exists", () => {
            const translation = translationService.getTranslation("TEST:TRANSLATION", "fr");
            expect(translation).equals("DEFAULT VALUE");
        });

    });

    describe('Request multiple translations', () => {

        it('should return correct translations if ids are existing', () => {
            const translations = translationService.getTranslations(["TEST:TRANSLATION", "TEST:TRANSLATION1"], "en");
            expect(translations).not.undefined;

            expect(translations["TEST:TRANSLATION"]).not.undefined;
            expect(translations["TEST:TRANSLATION"]).equals("TRANSLATED");

            expect(translations["TEST:TRANSLATION1"]).not.undefined;
            expect(translations["TEST:TRANSLATION1"]).equals("TRANSLATED1");
        });

        it('should return correct mixed translations and default value', () => {
            const translations = translationService.getTranslations(["TEST:TRANSLATION", "TEST:TRANSLATION1"], "de");
            expect(translations).not.undefined;

            expect(translations["TEST:TRANSLATION"]).not.undefined;
            expect(translations["TEST:TRANSLATION"]).equals("UEBERSETZT");

            expect(translations["TEST:TRANSLATION1"]).not.undefined;
            expect(translations["TEST:TRANSLATION1"]).equals("DEFAULT VALUE1");
        });

        it('should return correct mixed translations and default value and requested id', () => {
            const translations = translationService.getTranslations(["TEST:TRANSLATION", "TEST:TRANSLATION1", "NOT:EXISTING"], "de");
            expect(translations).not.undefined;

            expect(translations["TEST:TRANSLATION"]).not.undefined;
            expect(translations["TEST:TRANSLATION"]).equals("UEBERSETZT");

            expect(translations["TEST:TRANSLATION1"]).not.undefined;
            expect(translations["TEST:TRANSLATION1"]).equals("DEFAULT VALUE1");

            expect(translations["NOT:EXISTING"]).not.undefined;
            expect(translations["NOT:EXISTING"]).equals("NOT:EXISTING");
        });

    });

    describe('Request all translations', () => {

        it('should return all translation with correct values', () => {
            const translations = translationService.getAllTranslations("de");
            expect(translations).not.undefined;

            expect(translations["TEST:TRANSLATION"]).not.undefined;
            expect(translations["TEST:TRANSLATION"]).equals("UEBERSETZT");

            expect(translations["TEST:TRANSLATION1"]).not.undefined;
            expect(translations["TEST:TRANSLATION1"]).equals("DEFAULT VALUE1");

        });

    });
});