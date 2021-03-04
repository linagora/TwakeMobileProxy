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
