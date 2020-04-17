
##为Vue构造函数添加component、filter、directive
收集用户创建的组件（通过Vue.component创建的）、指令（通过Vue.directive创建）、过滤器（通过Vue.filter创建）

文件地址：\src\core\global-api\assets.js
```
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * ASSET_TYPES分别为   component   directive   filter
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {//此时代表获取 组件 、指定、过滤器
        return this.options[type + 's'][id]
      } else {
        //当是创建组件的时候，其实是直接调用extend进行处理，并返回一个组件的构造函数
        if (type === 'component' && isPlainObject(definition)) {
         
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        //当是指令的时候
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        //添加到当前Vue构造函数的option属性中
        //举例：如定义呢一个testComponent组件，则
        // Vue.options.components={testComponent:definition}
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
```