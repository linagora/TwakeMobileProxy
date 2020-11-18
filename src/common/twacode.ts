
const joinContent = (content: any)=>{
    if (Array.isArray(content)){
        return content.join("")
    }
    return content
}


export function fixIt(item: any): Object | null {

    if (typeof(item) === 'object'){
        if (item.type === 'nop') {
            return null
        }

        if(item.start==='@'){
            const content = item.content.split(':')
            return {
                "type": "user",
                "content": content[0],
                "id": content[1]
            }
        }

        if(item.start===':' && item.end===':'){
            return {
                "type": "emoji",
                "content": item.content,
            }
        }

        if(item.start==='**' && item.end==='**'){
            return {
                "type": "bold",
                "content": joinContent(item.content),
            }
        }

        if(item.start==='*' && item.end==='*'){
            return {
                "type": "italic",
                "content": joinContent(item.content),
            }
        }

        if(item.start==='#' && !item.end){
            const content = item.content.split(':')
            return {
                "type": "channel",
                "content": content[0],
                "id": content[1],
            }
        }

        if (Array.isArray(item.content) && item.content.length === 0){
            const r = {"type":"text", content: "" + item.start + item.end}
            if (r.content === '\n') return {"type":"br"}
            return r
        }

        // passing by as is
        if (['url','system', 'br', 'image','attachment'].includes(item.type)) {
            return item
        }
        // return item

    } else if (typeof(item) === 'string') {
        return {"type": "text", "content": item}
    }

    console.log(item)
    throw Error("Unparseable data")
}
