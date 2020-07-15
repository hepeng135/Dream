

####parse函数的钩子函数，用作处理标签

```
//开始标签的处理
start (tag, attrs, unary, start, end) {
    //创建ASTElement
    let element: ASTElement = createASTElement(tag, attrs, currentParent)
    
    //处理特殊属性,inVPre：默认false
    !inVPre && processPre(element); //处理v-pre，el.pre=true or false
    element.pre && inVPre=true;
    inVPre &&  processRawAttrs(element)
    !inVPre && (
        processFor(element),     //v-for  
        processIf(element),      //v-if
        processOnce(element),    //v-once
    )
    
    //确定root（根元素）   
    !root && root = element

    //确定父级，默认当前标签存在子元素。unary：当前标签是否有结束的标识，区别处理不用成对出现的标签
    !unary && (
        currentParent = element,
        stack.push(element) //维护stack数组，方便后面的闭合
    )
    unary && closeElement(element) //直接关闭标签
     
   
   
}
//结束标签的处理
end(tag, start, end) {

     //code....
     closeElement(element)
}
//文本标签的处理
chars(text: string, start: number, end: number) {
    
}
//注释的处理
comment (text: string, start, end){

}

```

#### 触发start钩子函数
    //parseStartTag正则匹配出开始标签，以及标签上的所有属性
    //{tagName,attrs:[attrList<Array>,....],start,end,unarySlash(标签结束位置标识)}
    //unarySlash：可区分当前标签是否单个出现，不用成对出现，例如 <hr/>
    
    //handleStartTag 
    //1:将匹配出来的属性处理成数组 attrs=[{name,value,start,end},....]
    //2:将标签信息添加到stack中  [{tag,lowerCaseTag,attrs,start,end}]
    //3:调用start钩子函数 start(tagName,attrs,unary,start,end)
    const startTagMatch = parseStartTag()
    if (startTagMatch) {
        handleStartTag(startTagMatch)
        continue
    }
    
    
####  触发end钩子函数
    //正则匹配出结束标签
    const endTagMatch = html.match(endTag)
    
    if (endTagMatch) {
        parseEndTag(endTagMatch[1], curIndex, index)
        continue
    }