####compile函数
    1：新建一个对象finalOptions，将baseOptions对象作为这个对象的__proto__;
    2: 判断当前options(compilerOptions)上是否存在moudles/directives，和finalOptions.moudles/directive进行数组合并
    3：将参数options(compilerOptions)上的属性拷贝给finalOptions,排除moudles/directives.
    4：调用baseCompile函数

#### 参数列表
>* @params template：当前的模板字符串
>* @params options:CompilerOptions编译模板的一些配置项。

```

function compile (template: string,options?: CompilerOptions): CompiledResult {
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
