
在Vue.prototype._init 中调用，作用



#### 参数列表
* parent:父级的组件选项，
* child:子集（当前）的组件选项 
* vm：当前组件的实例

#### 内部调用的函数详情说明
* normalizeProps：处理当前组件的props，详情<a href="./normalizeProps.md">normalizeProps</a>
* normalizeInject:处理当前组件的inject,详情<a href="./normalizeInject.md">normalizeInject</a>
* normalizeDirectives:处理当前组件内的directive,处理后的options.directives.dirName={bind:dirFn,update:dirFn}
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
    if (child.mixins) {//确定当前的options是否有
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