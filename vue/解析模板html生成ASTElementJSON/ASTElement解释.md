
####ASTElement [JSON] : 通过解析html模板生成标签信息json。

```
{
    type:[Number]标签类型   1：元素  2:带有表达式的文本  3：纯文本
    tag:[String] 标签名称
    attrList:[Array]  属性集合,[{name:attrName,value:attrValue,start:开始位置,end:结束位置}]
    attrsMap:[Object] 属性集合，与attrList对应 {attrName:attrValue}
    rawAttrsMap:[Object] 属性集合 与attrList对应  {attrName:{name:attrName,value:attrValue,start:开始位置,end:结束位置}}

    eg：<div>   <:为开始位置 ，>：为结束位置
    start:[Number],当前标签开始的位置  
    end:[Number],当前标签结束的位置

    parent:[Object] 当前标签的父级
    children:[Array] 当前标签的子级标签

    staticClass:[String] 静态class的值,
    classBinding:[String] 动态绑定class的表达式,
    
    staticStyle:[String] 静态style的值,
    styleBinding:[String] 动态绑定styled的表达式,


    forbidden:true| false  是否style或者script标签


    pre:true | false  当前元素已其子元素是否需要编译

    value in data | (value,index) in data | (value,name,index) in data 
    

    //解析v-for指令所得
    for: data
    alias:当前v-for 里面的value
    iterator1：当 (item,index) => index  ,(value,key,index) => key
    iterator1: 当 (item,index) => undefined  ,(value,key,index) => index
}
```