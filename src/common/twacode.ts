const joinContent = (content: any) => {
    if (Array.isArray(content)) {
        return content.join("")
    }
    return content
}

interface TwacodeItem {
    type: string
    content?: string
}

import {emojiGetCode} from './helpers'

export async function fixIt(item: any, previewFunction: (elementId: string) => Promise<string>): Promise<Object | null> {

    if (typeof (item) === 'object') {
        if (!Object.keys(item).length || item.type === 'nop') {
            return null
        }

        if (item.type === 'file' && item.mode === 'preview'){

            try {
                const url = await previewFunction(item.content)
                return {"type": "image", "content": url}
            } catch(e){
                console.error(e)
                return {"type": "unparseable", "content":"File not found"}
            }
        }

        if (item.start === '@') {
            const content = item.content.split(':')
            return {
                "type": "user",
                "content": content[0],
                "id": content[1]
            }
        }

        if (item.start === ':' && item.end === ':') {

            return {
                "type": "emoji",
                "content": item.content,
                "id": emojiGetCode(item.content)
            }
        }

        if (item.start === '**' && item.end === '**') {
            return {
                "type": "bold",
                "content": joinContent(item.content),
            }
        }

        if (item.start === '*' && item.end === '*') {
            return {
                "type": "italic",
                "content": joinContent(item.content),
            }
        }

        if (item.start === '```' && item.end.indexOf('```') > -1) {
            return {
                "type": "mcode",
                "content": item.content.trim()
            }
        }

        if (item.start === '`' && item.end.indexOf('`') > -1) {
            return {
                "type": "mcode",
                "content": item.content.trim()
            }
        }

        if (item.start === '>' && !item.end) {
            return {
                "type": "quote",
                "content": item.content.trim()
            }
        }


        if (item.start === '#' && !item.end) {
            const content = item.content.split(':')
            return {
                "type": "channel",
                "content": content[0],
                "id": content[1],
            }
        }

        if (Array.isArray(item.content) && item.content.length === 0) {
            const r = {"type": "text", content: "" + item.start + item.end}
            if (r.content === '\n') return {"type": "br"}
            return r
        }

        if (item.type == 'progress_bar') {
            return {"type": "progress_bar", "content": item.progress}
        }

        // passing by as is
        if ([
            'br',
            'icode',
            'mcode',
            'underline',
            'strikethrough',
            'bold',
            'italic',
            'mquote',
            'quote',
            'user',
            'channel',
            'nop',
            'compile',
            'url',
            'email',
            'system',
            'image',
            'emoji',
            'progress_bar',
            'attachment',
            'icon',
            'copiable',
            'text'
        ].includes(item.type)) {
            return item
        }

    } else if (typeof (item) === 'string') {
        return {"type": "text", "content": item}
    }

    throw Error("Unparseable data")
}


export function toTwacode(inputString: string | null) {

    if (!inputString) {
        return null
    }

    const result = [] as TwacodeItem[]

    function process(inputString: string): string | null {

        const pattern = /\n|\*\*|\*|~~|```/
        const found = pattern.exec(inputString)

        if (found) {

            let type = found[0]
            const idx = found.index

            if (inputString.substring(0, idx)) {
                result.push({
                    "type": "text",
                    "content": inputString.substring(0, idx)
                })
            }

            const restString = inputString.substring(idx + 1)

            let currentPattern = null

            if (type === '*') {
                currentPattern = /\*/
            } else if (type === '**') {
                currentPattern = /\*\*/
            } else {
                currentPattern = RegExp(type)
            }

            let closeIndex = null

            if (type === '\n') {
                closeIndex = -1
            } else {
                const closeFound = currentPattern.exec(restString)
                if (closeFound) {
                    closeIndex = closeFound.index
                }
            }

            if (closeIndex !== null) {
                if (type === '*') {
                    result.push({"type": "italic", "content": restString.substring(0, closeIndex)})
                } else if (type === '**') {
                    result.push({"type": "bold", "content": restString.substring(1, closeIndex)})
                } else if (type === '~~') {
                    result.push({"type": "strikethrough", "content": restString.substring(1, closeIndex)})
                } else if (type === '```') {
                    result.push({"type": "mcode", "content": restString.substring(2, closeIndex)})
                } else if (type === '\n') {
                    result.push({"type": "br"})
                }


                return restString.substring(closeIndex + type.length)

            } else {
                return restString
            }
        } else {
            if (inputString) {
                result.push({"type": "text", content: inputString})
            }
            return null
        }


    }


    while (inputString) {
        inputString = process(inputString)
    }
    return result
}


