
####正则表达式startTagOpen，获取标签的开始
    startTagOpen=/^<\/((?:[a-zA-Z_][\-\.0-9_a-zA-Z])?[a-zA-Z_][\-\.0-9_a-zA-Z])[^>]*>/
    //获取开始标签内容  <div></div> => ['<div','div',index:0,input:原html] 
    html.match(startTagOpen)
    
####正则表达式startTagClose，获取标签的关闭.
    startTagClose= /^\s*(\/?)>/
    //标签闭合 “ />” => [' />','/',index:0]  “  >” =》[" >", "", index: 0, input: " >", groups: undefined]
    html.match(startTagOpen)  
    
####正则表达式dynamicArgAttribute，匹配属性，包括指令的修饰符，参数，绑定动态值
    dynamicArgAttribute=/^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
    "v-bind:[key].target='xxxx'" =>["v-bind:[key].target='xxxx'", "v-bind:[key].target", "=", undefined, "xxxx", undefined, index: 0, input: "v-bind:[key].target='xxxx'", groups: undefined]
    html.match(dynamicArgAttribute)
    
####正则表达式attribute，匹配普通的属性。
    attributes=/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    v-if="message" | :class="xxxx" | v-for="" | @click="xxxx" =>["v-if='xxxxx'",'']  
    html.match(attributes)

##函数parseStartTag的作用：解析开始标签、并解析出标签上的所有属性，返回一个对象
```
返回的对象
{
    tagName:标签名称
    attrs:[matchVal1,matchVal2] //标签属性集合，每项都是match正则得到的数组
    start:标签开始位置
    end:标签结束的位置
    unarySlash：标签闭合的内容，一般为空格  或者  /
}

function parseStartTag () {
    //通过正则获取当前模板的开始标签
    //正则表达式：/^<\/((?:[a-zA-Z_][\-\.0-9_a-zA-Z])?[a-zA-Z_][\-\.0-9_a-zA-Z])[^>]*>/
    //获取的内容<div></div> => ['<div','div',index:0,input:原html] 
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      //截取获取新的html，去掉已经处理的标签。
      advance(start[0].length)
      let end, attr
       //当前不是单个结束标签，并且带有属性，获取属性。
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index
        ///截取获取新的html，去掉正则出来的属性。
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
}


```
##处理已经解析的开始标签,并调用start函数
   参数列表
   @params match:当前解析出的标签集合
   
```
function handleStartTag (match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash
    
    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }
    //检测当前是否单个可闭合便签
    const unary = isUnaryTag(tagName) || !!unarySlash
    
    const l = match.attrs.length
    const attrs = new Array(l)
    //将match.attrs中的属性处理成以下形式
    // [{name:attrName,value:attrVal,start:attrStartPs,end:attrEndPs}]
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      const value = args[3] || args[4] || args[5] || ''  //获取当前属性的表达式
        
        //处理换行编码这个浏览器特性
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
      if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        //增加属性的开始位置，算上空格
        attrs[i].start = args.start + args[0].match(/^\s*/).length
        //结束位置
        attrs[i].end = args.end
      }
    }
    //如果当前不是单个可闭合标签
    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
      lastTag = tagName
    }
    
    //调用start函数
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }
```
