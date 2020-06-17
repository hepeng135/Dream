
####解析结束标签
####参数列表
    @params tagName: 当前标签名
    @params start:标签开始的index
    @params end：标签结束的index

```
function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index
    
    // 从stack中寻找（index）出当前闭合标签是属于哪个标签的
    if (tagName) {
        lowerCasedTagName = tagName.toLowerCase()
        //从stack数组的尾部开始寻找
        for (pos = stack.length - 1; pos >= 0; pos--) {
            if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                break
            }
        }
    } else {
        // If no tag name is provided, clean shop
        pos = 0
    }
    
    if (pos >= 0) {
        // Close all the open elements, up the stack
        //  stack数组尾部开始循环，限制条件为pos，然后调用end做标签结束处理
        for (let i = stack.length - 1; i >= pos; i--) {
            if (options.end) {
                options.end(stack[i].tag, start, end)
            }
        }
        stack.length = pos
        lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') { //处理
        if (options.start) {
            options.start(tagName, [], true, start, end)
        }
    } else if (lowerCasedTagName === 'p') {
        if (options.start) {
            options.start(tagName, [], false, start, end)
        }
        if (options.end) {
            options.end(tagName, start, end)
        }
    }
}

```