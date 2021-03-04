import Base from "../common/base";

import emojiData from '../common/emoji.json';

export default class extends Base {
    async emoji() {
        return emojiData
    }
}
