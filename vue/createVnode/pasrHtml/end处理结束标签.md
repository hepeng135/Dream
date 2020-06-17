

```
function end (tag, start, end) {
    //获取需要闭合的标签
    const element = stack[stack.length - 1]
    // 从stack中删除这个标签
    stack.length -= 1
    //获取这个标签的父级标签
    currentParent = stack[stack.length - 1]
    if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        element.end = end//更新标签结束的位置
    }
    closeElement(element)
}
```