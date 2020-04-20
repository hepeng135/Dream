
在Vue.prototype._init 中调用

#### 参数列表
>* parent:父级的组件选项，
>* child:子集（当前）的组件选项 
>* vm：当前组件的实例

### 内部重要变量说明，start：options的初始值，保存有以下初始属性
>start这个对象中的没个属性都对应一个方法函数。
>* strats.data：猜想是处理options.data的，需要进一步看源码
>* strats.beforeCreate/created/beforeMount/mounted/beforeUpdate/updated/beforeDestroy/destroyed/activated/deactivated/errorCaptured/serverPrefetch
    处理钩子函数，也需要进一步查看源码
>* strats.components/directives/filters:处理组件，指令，过滤器，需要进一步看源码
>* strats.watch   :观察变化，需要进一步看源码
>* start.props/methods/inject/computed
>* start.provide


#### 内部调用的函数详情说明
>* normalizeProps：处理当前组件的props，详情<a href="./normalizeProps.md">normalizeProps</a>
>* normalizeInject:处理当前组件的inject,详情<a href="./normalizeInject.md">normalizeInject</a>
>* normalizeDirectives:处理当前组件内的directive,处理后的options.directives.dirName={bind:dirFn,update:dirFn}
```
/*


*/
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
    
  if (typeof child === 'function') {
    child = child.options
  }
   //处理组件内的props，
  normalizeProps(child, vm)
   //处理组件内的inject
  normalizeInject(child, vm)
   //处理组件内的directives
  normalizeDirectives(child)

  //判断当前的child是否是Vue这个构造函数的options
  if (!child._base) {
    if (child.extends) {//确定当前的options是否有extends
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {//确定当前的options是否有mixins
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```