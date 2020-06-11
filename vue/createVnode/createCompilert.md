#### baseCompile函数
    1:调用parse函数，进行模板解析，返回解析完成的vnode
    2:

#### baseCompile函数的参数
>* @params template:当前的模板字符串
>* @params options：baseOptions和compileOptions合并后的版本。
>
```
function baseCompile (
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
}

```