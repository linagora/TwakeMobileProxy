import Api from "../../common/twakeapi2";
import {Forbidden} from "../../common/errors";
import assert from "assert";
import config from "../../common/config";


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

    serverInfo() {
        return this.api.get('/ajax/core/version', {}).then(a => a.data).then(a => {

            if (a.auth && a.auth.console) {
                a.auth.console.mobile_endpoint_url = config.core_host + "/ajax/users/console/openid?mobile=1"
            }
            a.core_endpoint_url = config.core_host
            a.socket_endpoint = {
                host: config.core_host,
                path: "/socket"
            }
            return a
        })
    }
}
