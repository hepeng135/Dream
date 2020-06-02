
####简介
每个组件在实例时都需要去调用该函数，初始化以下属性，并挂载到当前组件的实例上

>* parent.$children.push(vm)  为当前组件的父级创建子集集合，都排除vue内部组件
>* vm.$parent   为当前组件实例添加$parent属性，指向当前组件的父级（不会为Vue的内部组件）。
>* vm.$root    为当前的组件添加$root,指向当前组件的根组件（祖先组件）。
>* vm.$children 为当前组件添加$children，指向当组件的子组件集合
>* vm.$refs  为当前组件添加$refs，指向当前组件中注册过ref自定义属性的DOM元素和子组件实例
>* vm._watcher=null
>* vm._inactive=null
>* vm._directInactive=false
>* vm._isMounted=false
>* vm._isDestroyed=false
>* vm._isBeingDestroyed=false


####参数说明
> *@params vm : 当前组件实例

```
function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {  //当前组件拥有父级，而且不是vue的内部组件
    while (parent.$options.abstract && parent.$parent) {//vue的内部组件不存在子级父级，可以理解成为一些有用的html元素。
      parent = parent.$parent
    }
    parent.$children.push(vm)//当前组件的父组件只能是自己创建的组件。
  }


  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

```