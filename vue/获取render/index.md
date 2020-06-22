
## render函数的生成

1：调用compileToFunctions函数，对模板字符串进行缓存，并调用compile函数得。

2：调用compile函数，对options和baseOptions进行合并得到finalOptions，并调用baseCompile函数

3：调用baseCompile函数





#### 生成render的主要代码如下（伪代码简化版）
```
//路径src/platforms/web/entry-runtime-with-compiler
import { compileToFunctions } from './compiler/index'
const { render, staticRenderFns } = compileToFunctions(template, {
    outputSourceRange: process.env.NODE_ENV !== 'production',
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
}, this)


//路径src/platforms/web/compiler/index

const { compile, compileToFunctions } = createCompiler(baseOptions)



//路径src/compiler/index

import { createCompilerCreator } from './create-compiler'
const createCompiler=createCompilerCreator(function(template,options){
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


//路径src/compiler/create-compiler

import { createCompileToFunctionFn } from './to-function'
@params baseCompile [Object]
@return createCompiler [Function]
function createCompilerCreator(baseCompile){
    @params baseOptions [Object]
    return function createCompiler(baseOptions){
        
        function compile(template,options){
            const finalOptions = Object.create(baseOptions)
            finalOptions.modules =(baseOptions.modules || []).concat(options.modules)
            finalOptions.directives = extend(Object.create(baseOptions.directives || null),options.directives)
            for (const key in options) {
              if (key !== 'modules' && key !== 'directives') {
                finalOptions[key] = options[key]
              }
            }
            const compiled = baseCompile(template.trim(), finalOptions)
            return compiled
        }
        return {
            compile,
            compileToFunctions: createCompileToFunctionFn(compile)
        }
    }
}


//路径src/compiler/to-function
function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
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


```


