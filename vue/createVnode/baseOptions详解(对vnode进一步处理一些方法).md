## 处理vnode的一些辅助函数集合

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

#### expectHTML：true  常量，一直为true，表示模板传入的是html

#### modules: [klass,style,model]对应处理class、style、model的集合

#### modules.klass集合详情如下所示
>* klass.staticKeys:['staticKeys']  常量。
>* klass.transformNode: getAndRemoveAttr(el,name,removeFromMap)
> ```
> 函数作用：从el中的attrList删除对应name的项，当removeFromMap为true时同时删除attrsMap的对应项
> @params el:当前对应的vdom
> @paeams name:需要处理的属性名
> @params removeFromMap：是否同时删除attrsMap的对应项
> export function getAndRemoveAttr (el: ASTElement,name: string,removeFromMap?: boolean): ?string {
> let val
>    if ((val = el.attrsMap[name]) != null) {
>      const list = el.attrsList
>      for (let i = 0, l = list.length; i < l; i++) {
>        if (list[i].name === name) {
>          list.splice(i, 1)
>          break
>        }
>      }
>    }
>    if (removeFromMap) {
>      delete el.attrsMap[name]
>   }
>    return val
>  }
> ``` 
>* 
>  

>
>
>

