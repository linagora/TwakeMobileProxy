import Base from "./base";

export default class extends Base {

    async info(){
        return this.api.serverInfo()
    }
}