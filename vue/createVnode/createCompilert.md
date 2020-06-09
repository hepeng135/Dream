
####createCompilerCreator函数
    调用createCompilerCreator函数，并传入一个函数，返回一个对象

#### baseCompile函数

#### baseCompile函数的参数
>* @params template:当前的模板字符串
>* @params options：baseOptions和compileOptions合并后的版本。
>
#### baseCompile内部函数调用
>* parse ：解析html
```
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})

```