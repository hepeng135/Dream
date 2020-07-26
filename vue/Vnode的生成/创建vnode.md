





```
vm.c=function(a,b,c,d){
    return createElement(vm, a, b, c, d, false)
}
vm.$createElement=function(a,b,c,d){
    return createElement(vm, a, b, c, d, true)
}
vm.options._render=function(){
    with(this){
        _c(a,b,c,d)
    }
} 

vm.options._render.call(vm,vm.$createElement)

/*
* @context:当前组件的实例
* @tag:标签
* @data：标签上的属性集合
* @children：标签的子节点
* 
*@alwaysNormalize ： 区别内部调用或者外部调用
*/


export function createElement (context: Component,tag: any, data: any,children: any,normalizationType: any, alwaysNormalize: boolean): VNode | Array<VNode> {
    //当前data 是 Array  或  String 或 Number 或 symbol 或 Boolean
    //既当没有属性data的时候
    if (Array.isArray(data) || isPrimitive(data)) {
        normalizationType = children //
        children = data
        data = undefined
    }
    if (isTrue(alwaysNormalize)) {
        normalizationType = ALWAYS_NORMALIZE
    }
    return _createElement(context, tag, data, children, normalizationType)
}

```