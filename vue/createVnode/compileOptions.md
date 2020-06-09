## 在compileToFunctions函数中作为参数对模板进行编译，有以下几项

#### outputSourceRange：当前的开发环境。 true ：开发   false：生产  （我们看源码默认为true，此属性可以忽略）

#### shouldDecodeNewlines：在标签元素的属性中增加换行符是否会被编码，IE中的换行会被编码（测试后是这样的）

#### shouldDecodeNewlinesForHref：在href中增加换行符是否会被编码，Chrome中换行会被编码（测试后没出现这种现象）

#### delimiters 当前纯文本插入分隔符，默认 ["{{"，"}}"]

#### comments 在编译生成vnode中是否保留模板中的注释


```
let div
function getShouldDecode (href: boolean): boolean {
  div = div || document.createElement('div')
  div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`
  return div.innerHTML.indexOf('&#10;') > 0
}

//IE在属性值内编码换行，而其他浏览器不这样做
export const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false
// #6828: chrome encodes content in a[href]
export const shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false

```