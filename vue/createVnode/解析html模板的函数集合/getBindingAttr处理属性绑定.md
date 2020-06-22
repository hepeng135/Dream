



```
export function getBindingAttr (
  el: ASTElement,
  name: string,
  getStatic?: boolean
): ?string {
  const dynamicValue =
    //从el的attrsList中移除:className或者v-bind:className
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name)
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}


该函数和klass.transformNode的作用一样
 函数作用：处理style和绑定的style(:style/v-style:class),
            a:将style从el.attrsList中移除。当removeFromMap为true时，同时从el.attrsMap中移除style，并返回对应的staticStyle，并添加到el.staticClass
            b:获取绑定style的表达式,并解析出过滤器，添加到el.styleBinding中。
function transformNode (el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn
  const staticStyle = getAndRemoveAttr(el, 'style')
  if (staticStyle) {
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
  }
  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

//处理表达式中的过滤器
export function parseFilters (exp: string): string {
  let inSingle = false //是否单引号
  let inDouble = false //是否双引号
  let inTemplateString = false
  let inRegex = false
  let curly = 0 //当值>0时表示当前表达式中有{,并且还没有结尾
  let square = 0  //当值>0时表示当前表达式中有[,并且还没有结尾
  let paren = 0  //当值>0表示当前表达式中有(,并且还没有结尾
  let lastFilterIndex = 0
  let c, prev, i, expression, filters
  //  0x22等都是ASCII码的16进制
  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {
      //判断当前字符是单引号并且没有被转义
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      //判断当前字符是双引号并且没有被转义
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      //判断当前是否es6字符串模板的`号，并且没有被转义
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      //判断当前是否/符号并且没有被转义
      if (c === 0x2f && prev !== 0x5C) inRegex = false
      //判断当前是|符号，并且上一个字符不是0x7C并且下一个也不是0x7C，并且不是在{}中 [] 中 () 中
    } else if (c === 0x7C && exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
      if (expression === undefined) {
        // 第一个过滤器的开始，既表达式的结束
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
        pushFilter()
      }
    } else {
      //确定当前字符是否下面某个字符，既这里确定开通，上面是处理结束
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1  //上一个
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) { //查找第一个非空的上一个字符
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }


  if (expression === undefined) {//当前没有过滤器时，指处理表达式
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {//当前只有一个过滤器时，或者最后一个过滤器时
    pushFilter()
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression  //返回 message  或者  f("filterName")(message,arg1,agr2)
}

function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(')
  if (i < 0) { //当没传递参数时
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`   //'f("add")(expression)'
  } else {
    const name = filter.slice(0, i)//函数名
    const args = filter.slice(i + 1)//参数
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`  //'f("add")(expression,arg1,arg2)';
  }
}


```