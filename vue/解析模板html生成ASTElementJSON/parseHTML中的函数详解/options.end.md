end:end钩子函数，处理结束标签，维护stack数组，更新currentParent,并调用closeElement函数


```
function end (tag, start, end) {
    //获取需要闭合的标签
    const element = stack[stack.length - 1]
    // 从stack中删除这个标签
    stack.length -= 1
    //更新currentParent
    currentParent = stack[stack.length - 1]
    if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        element.end = end//更新标签结束的位置
    }
    closeElement(element)
}
```

closeElement：


```
function closeElement (element) {
    //移除children中的空白标签
    trimEndingWhitespace(element)
    //inVPre：如果当前没有拥有v-pre指令。
    //element.processed：是否处理过 class style ref key  slot component 等特殊的属性
    if (!inVPre && !element.processed) {
        element = processElement(element, options)
    }
    // 当前stack数组为空并且当前的element和root不是同一个元素时
    if (!stack.length && element !== root) {
        //当root和最后一个element是并存关系时，必须是if和else的关系
        if (root.if && (element.elseif || element.else)) {
            addIfCondition(root, {
                exp: element.elseif,
                block: element
            })
        }
    }
    //如果当前标签有父级  并且 不是script或者style标签
    if (currentParent && !element.forbidden) {
        //如果当前标签拥有elseif  或者 else 属性
        if (element.elseif || element.else) {
            //寻找到当前上一个兄弟标签，并增加对应的条件,表示满足这个条件则显示这个
            //prevSublingElement.ifConditions.push({exp:expression,block:element})
            processIfConditions(element, currentParent)
        } else {
            if (element.slotScope) {
                // scoped slot
                // keep it in the children list so that v-else(-if) conditions can
                // find it as the prev node.
                const name = element.slotTarget || '"default"'
                ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
            }
            currentParent.children.push(element)
            element.parent = currentParent
        }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(c => !(c: any).slotScope)
    // remove trailing whitespace node again
    trimEndingWhitespace(element)

    // check pre state
    if (element.pre) {
        inVPre = false
    }
    if (platformIsPreTag(element.tag)) {
        inPre = false
    }
    // apply post-transforms
    for (let i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options)
    }
}


```
