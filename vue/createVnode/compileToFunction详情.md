####函数的作用
    编辑当前template,

####文件路径
    /src/compiler/to-function.js
    
#### 参数列表
>* @params template：当前的模板字符串
>* @params options:编译模板的一些配置项，详情可以查看compileOptions.md文件。
>* @params vm:当前组件实例

####内部函数调用说明
>* compile (template, options):将baseOption与CompileOptions进行合并操作，在调用baseCompile函数。

```
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (template: string,options?: CompilerOptions,vm?: Component): CompiledFunctionResult {
    //重写创建一个options对象，里面的属性来自原来的options，互不影响。
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn

    // 检测当前缓存。
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }
    // 编译
    const compiled = compile(template, options)
    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cache[key] = res)
  }
}
```