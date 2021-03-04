import Api from "../../common/twakeapi2";
import {Forbidden} from "../../common/errors";
import assert from "assert";


export default class InfoService {

    constructor(protected api: Api) {
    }


    getLocalizationStrings(lang: string) {

        let res = require('../../resources/localization/en.json')

        if (lang != 'en') {
            assert(/^[a-zA-Z]{2}$/.test(lang), 'wrong lang value')

            try {
                const loaded_lang = require(`../../resources/localization/${lang}.json`)
                res = {...res, ...loaded_lang}
            } catch (e) {
                // console.log(e)
                // do nothing
            }

        }

        return res
    }
}