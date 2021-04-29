export const localizationGetSchema = {
    tags: ['Info'],
    summary: 'Localization string',
    querystring: {
        type: 'object', "required": ["lang"],
        "properties": {
            "lang": {"type": "string"}
        }
    }

}
export const emojiSchema = {
    tags: ['Info'],
    summary: 'List of available emojis',
    querystring: {
        type: 'object', "required": [],
        properties: {}
    }
}