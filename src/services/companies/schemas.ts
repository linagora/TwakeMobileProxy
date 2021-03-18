export const companiesSchema = {
    tags: ['Companies'],
    summary: "List of user's companies",
    querystring: {type: 'object', required: [], "properties": {}}
}
export const badgesSchema = {
    tags: ['Badges'],
    summary: 'Aggregation of notification badges across company',
    querystring: {
        type: 'object',
        "required": ['company_id'],
        "properties": {"company_id": {"type": "string"}, "all_companies": {"type":"boolean"}}
    }
}
