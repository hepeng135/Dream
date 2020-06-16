
####函数作用：当解析到纯文本的时候调用。




```
chars (text: string, start: number, end: number) {
    //是否有父级标签
      if (!currentParent) {
        return
      }
    //处理Ie下Textarea的placeholdr的bug，Ie9中textarea的placeholder值会加到textarea标签中
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
    //获取当前父级下的子集
      const children = currentParent.children
    //是否pre标签或者去掉空格后还有文本
      if (inPre || text.trim()) {
        //当前父级是否script标签或者style标签,
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text)//将字符串进行解码
      } else if (!children.length) {//当是空白节点时
        text = ''
      } else if (whitespaceOption) {//空格文本处理配置，在vue中是undefined，既没有配置
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' '
        } else {
          text = ' '
        }
      } else {//preserveWhitespace 默认为true，保留空格
        text = preserveWhitespace ? ' ' : ''
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE, ' ')
        }
        let res
        let child: ?ASTNode
        //当前带有表达式的文本，既xxx{{xxx}}xxx
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text
          }
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text
          }
        }
        if (child) {
          if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
            child.start = start
            child.end = end
          }
          children.push(child)
        }
      }
    },


```