var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')



describe('Users', async function () {
    this.timeout(10000);

    const api = new Api()

    before(async function () {
        await api.auth()
        await api.selectCompany('TestCompany')
    })

    step('Search users', async function () {
        const info = await api.searchUsers('test')
        assert(info.length, 'no users found')

    })

    step('User Profile', async function(){
        const {username, firstname, lastname, language, picture, password} = await api.getUserProfile()
        assert(username)
        assert(firstname)
        assert(lastname)
        assert(language)
        assert(picture)
        assert(password)

        console.log('username:', username.value,'firstname:', firstname.value, 'lastname:', lastname.value, 'language:',language.value)

        const expectedLanguage = language.value === 'ru' ? 'en' : 'ru'

        const {language:updatedLanguage} = await api.updateProfile({'language': expectedLanguage});

        assert.strictEqual(updatedLanguage.value,expectedLanguage, "languages doesn't match")

        const expectedFirstname = firstname.value + '1'

        const {firstname:updatedFirstName} = await api.updateProfile({'firstname': expectedFirstname});

        assert.strictEqual(updatedFirstName.value, expectedFirstname)

        const expectedLastname = lastname.value + '1'
        const {lastname:updatedLastName} = await api.updateProfile({'lastname': expectedLastname});

        assert.strictEqual(updatedLastName.value, expectedLastname)

        await api.updateProfile({'password': {old:'12345678', new:'12345678'}});

        await api.updateProfile({firstname:'firstname', lastname:'lastname'});
    })


});