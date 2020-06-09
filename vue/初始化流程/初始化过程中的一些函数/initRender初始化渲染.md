

####参数列表
>* @params vm 当前组件的实例

```
//主要处理插槽  $slots  $scopedSlots
export function initRender (vm: Component) {

  vm._vnode = null // the root of the child tree

  vm._staticTrees = null // v-once cached trees

  const options = vm.$options

  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree

  const renderContext = parentVnode && parentVnode.context
   
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject

  //把createElement函数挂载到当前组件的实例上
  /**
    *@params a : 标签
    *@params b : 数据
    *@params c : 子元素
    *@params d : 
  **/
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)


  //用户编写时使用的渲染函数，既在组件中使用render函数
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  
  const parentData = parentVnode && parentVnode.data

  
  //$attr $listeners的响应化。
  defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
  defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  
}

```