

1：在src/compiler/to-function中创建createCompileToFunctionFn函数，并返回一个内部的区部函数 compileToFunctions







代码简化

```
//路径src/compiler/to-function

function createFunction (code, errors) {
    return new Function(code)
}

//@params compile [Function]
//@return compileToFunctions [Function] 
function createCompileToFunctionFn(compile){
    const cache = Object.create(null)
`   @params template [String] : 当前模板
    @params options  [Object] : 解析模板的配置属性、方法
    @params vm  当前组件实例  
    @return 
    return function compileToFunctions(template,options,vm){
        //code...
        const compiled = compile(template, options)
        const res = {}
        const fnGenErrors = []
        res.render = createFunction(compiled.render, fnGenErrors)
        res.staticRenderFns = compiled.staticRenderFns.map(code => {
          return createFunction(code, fnGenErrors)
        })
        return (cache[key] = res)
    }
}

//



```






####导入compileToFunctions函数,我们从调用处去逆推

路径：src/platforms/web/entry-runtime-with-compiler.js
```
import { compileToFunctions } from './compiler/index'
```

路径：src/platforms/web/compiler/index

```
//导入配置文件，一些用来处理标签的函数集合，
import { baseOptions } from './options'
//导入createCompiler方法
import { createCompiler } from 'compiler/index'
//调用createCompiler函数结构出compile，和 compileToFunctions函数
const { compile, compileToFunctions } = createCompiler(baseOptions)
//输出 compile 和  compileToFunctions
export { compile, compileToFunctions }

```

路径：src/compiler/index

简介：

1：定义一个函数baseCompile。
2：调用createCompilerCreator函数以baseCompile作为参数，并返回一个函数createCompiler

```

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

//调用createCompilerCreator函数并传入一个baseCompile函数作为参数，获取返回的createCompiler函数
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
路径：src/compiler/create-compiler

简介：

1：定义createCompilerCreator函数，并在该函数内部定义局部函数createCompiler
    
    createCompilerCreator：
    @params baseCompile:[Function]
    @return createCompiler:[Functioncn] createCompiler 
    
    createCompiler：
    @params CompilerOptions：[Object]
    @return  [Object] {compile, compileToFunctions: createCompileToFunctionFn(compile)}
```
import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'
//直接返回一个createCompiler函数
export function createCompilerCreator (baseCompile: Function): Function {

  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []

      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          //检测当前模板的开头是否有空格
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn

      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
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

