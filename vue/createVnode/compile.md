####createCompilerCreator函数
    接受一个baseCompile参数（编译性功能函数对象）。返回一个createCompiler函数

#### createCompiler函数
    详情：    
#### 参数列表
>* @params template：当前的模板字符串
>* @params options:编译模板的一些配置项，详情可以查看compileOptions.md文件。


####函数内部调用说明
>* baseCompile：作为createCompilerCreator函数传进来，返回
```
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
        //创建以baseOptions作为原型的对象finalOptions；
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []

      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        //判断options上是否拥有modules,将options.modules追加到baseOptions.modules中
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // 判断options上是否有directives,将options.directives追加到baseOptions.directives中
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        //将options上的其他属性合并到finalOptions上。
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }
      finalOptions.warn = warn

      const compiled = baseCompile(template.trim(), finalOptions)
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}


```