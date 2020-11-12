import Api from '../common/twakeapi.js'

/**
 * The Base controller
 */
export default class {
  userProfile
  #api

  /**
   * @param {object} userProfile
   */
  constructor(userProfile) {
    this.userProfile = userProfile
    this.#api = null
  }

  /**
   * getter for api property
   * @return {Api}
   */
  get api() {
    if (!this.#api) {
      this.#api = new Api(this.userProfile)
    }
    return this.#api
  }
}
