
#### 处理v-for

#### 函数的主要作用
    1：通过getAndRemoveAttr函数获取v-for的表达式，并从el.attrsList中删除对应项。
    2：parseFor解析v-for表达式,返回res。 eg: item for message
        {
            for: 数据源 message
            alias ：循环时当前项 item
            iterator1 : key  当前项的名称   jsonKey 或者 arrIndex
            iterator2 : index 当前项的index
        }
    3：extend: 将res上的属性添加到 el上

```
export function processFor (el: ASTElement) {
    let exp
    //从el.attrsMap上获取对应的属性值，并从el.attrsList中删除对应的项
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
        解析出v-for的表达式
        const res = parseFor(exp)
        if (res) {
            extend(el, res)
        } 
    }
}

```


