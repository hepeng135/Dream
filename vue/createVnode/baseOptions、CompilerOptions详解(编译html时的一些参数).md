##CompilerOptions编译模板的一些属性集合，作为参数贯穿整个compile阶段



####outputSourceRange：当前的开发环境。 true ：开发   false：生产  （我们看源码默认为true，此属性可以忽略）

#### shouldDecodeNewlines：在标签元素的属性中增加换行符是否会被编码，IE中的换行会被编码（测试后是这样的）

#### shouldDecodeNewlinesForHref：在href中增加换行符是否会被编码，Chrome中换行会被编码（测试后没出现这种现象）

#### delimiters 当前纯文本插入分隔符，默认 ["{{"，"}}"]

#### comments 在编译生成vnode中是否保留模板中的注释

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


## baseOptions处理vnode的一些辅助函数集合
###集合的数据结构如下所示
```
const baseOptions={
    expectHTML: true
    modules: (3) [{…}, {…}, {…}]
    directives: {model: ƒ, text: ƒ, html: ƒ}
    isPreTag: ƒ (tag)
    isUnaryTag: ƒ (val)
    mustUseProp: ƒ (tag, type, attr)
    canBeLeftOpenTag: ƒ (val)
    isReservedTag: ƒ (tag)
    getTagNamespace: ƒ getTagNamespace(tag)
    staticKeys: "staticClass,staticStyle"
}
```
###集合下各个数据项的意思

> #### expectHTML：true  常量，一直为true，表示模板传入的是html

> #### modules: [klass,style,model]对应处理class、style、model的集合
>>*  klass.staticKeys:['staticKeys']  常量
>>*  klass.transformNode:处理静态class和绑定class，函数如下    
```
    函数作用：处理class和绑定的class(:class/v-bind:class),
            a:将class从el.attrsList中移除。当removeFromMap为true时，同时从el.attrsMap中移除class，并返回对应的classValue，并添加到el.staticClass
            b：获取绑定class的表达式，添加到el.classBinding中。
            
    参数列表：
    @params el:vdom
    @paeams name:需要处理的属性名
    
    export function getAndRemoveAttr (el: ASTElement, options: CompilerOptions){
        const warn = options.warn || baseWarn
        //将class从attrsList中移除，并返回这个class对应的值
        const staticClass = getAndRemoveAttr(el, 'class')
         //向el中添加staticClass属性
        if (staticClass) {
            el.staticClass = JSON.stringify(staticClass)
        }
        //获取绑定class的表达式，并从attrsList中移除这个自定义属性:className/v-bind:className,并添加到el.classBinding
        //:class="{name:'true',age:ageState}"   获取为"{name:'true',age:ageState}"
        const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
        if (classBinding) {
            el.classBinding = classBinding
        }
    }
```
>>*  klass.genData:genData(el)，将el.staticClass,el.classBinding处理成字符串并返回,'staticClass:classValue,class:classExpression'
>>*  style.staticKeys:['staticStyle'] 常量
>>*  style.transformNode:处理静态的style和绑定的style，和klass.transformNode类似。
```
该函数和klass.transformNode的作用一样
 函数作用：处理style和绑定的style(:style/v-style:class),
            a:将style从el.attrsList中移除。当removeFromMap为true时，同时从el.attrsMap中移除style，并返回对应的staticStyle，并添加到el.staticClass
            b:获取绑定style的表达式，添加到el.styleBinding中。
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
```
>>* klass.genData(el):将el.staticStyle,el.styleBinding处理成字符串并返回,'staticStyle:styleValue,style:styleExpression'
>>* model.preTransformNode(el,options)：处理input的vdom
```
    //获取v-if的表达式，并从el.attrsList、el.attrsMap中移除
   const ifCondition = getAndRemoveAttr(el, 'v-if', true);
    
```


>#### isPreTag(el)：返回当前标签是否pre
```
export const isPreTag = (tag: ?string): boolean => tag === 'pre'
```
>#### isUnaryTag(el):当前标签是否不需要闭合 eg: hr,br
```
export const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
)
```
>#### mustUseProp(el):判断当前属性在该标签上是否必选用props绑定  ?
```
 attrName   tag
  value      input,textarea,option,select,progress  (input 对应value的一些标签)
             button
  selected   option
  checked    input
  muted      video
const acceptValue = makeMap('input,textarea,option,select,progress')
export const mustUseProp = (tag: string, type: ?string, attr: string): boolean => {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
}
````
>#### canBeLeftOpenTag(tag):判断当前是否自动闭合的标签
```
export const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)
```
>#### getTagNamespace(tag) :判断当前标签是否svg，或者math
```
export function getTagNamespace (tag: string): ?string {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}
```

>#### isReservedTag(tag) :确定当前标签是html标签或者svg标签
```
export const isReservedTag = (tag: string): ?boolean => {
  return isHTMLTag(tag) || isSVG(tag)
}
export const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)
export const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
)
```