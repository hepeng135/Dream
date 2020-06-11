## 将template生成Vnode的步骤
     const { render, staticRenderFns } = compileToFunctions(template, {
            outputSourceRange: process.env.NODE_ENV !== 'production',
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,
            delimiters: options.delimiters,
            comments: options.comments
          }, this)
    
### 1:解析compileToFunctions函数是怎么定义的。
    1):import { compileToFunctions } from './compiler/index',
    首先compileToFunctions是从src/platforms/web/compiler/index文件导出的，
    
    2):import { baseOptions } from './options'
       import { createCompiler } from 'compiler/index'
       const { compile, compileToFunctions } = createCompiler(baseOptions)
       export { compile, compileToFunctions }
    
    首先 createCompiler 函数从 src/compiler/index中导出
    compileToFunctions 通过调用createCompile(baseOptions)函数的返回值解构出来
     
     3):import { createCompilerCreator } from './create-compiler'
        export const createCompiler = createCompilerCreator(function baseCompile (template: string,options: CompilerOptions):CompiledResult{
            code````
            code```
            return {
                ast,
                render: code.render,
                staticRenderFns: code.staticRenderFns
            }
        }
     首先 reateCompilerCreator函数从src/compiler/create-compiler中导出，
     调用createCompilerCreator函数，传入baseComPile函数作为参数，并将返回值赋值给 createCompiler；
     
     4):import { createCompileToFunctionFn } from './to-function'
        export function createCompilerCreator (baseCompile: Function): Function {
            return function createCompiler (baseOptions: CompilerOptions){
                   function compile (template: string,options?: CompilerOptions): CompiledResult{
                        code...
                   }
                   return {
                     compile,
                     compileToFunctions: createCompileToFunctionFn(compile)
                   }
            }
        }
     定义createCompilerCreator函数，调用将返回createCompiler函数。
     定义createCompiler函数,调用将返回compile函数，compileToFunctions函数
     compileToFunctions函数通过调用createCompileToFunctionFn函数返回
     
     5)定义createCompileToFunctionFn函数
       export function createCompileToFunctionFn (compile: Function): Function {
            const cache = Object.create(null)
            return function compileToFunctions(template: string,options?: CompilerOptions,vm?: Component): CompiledFunctionResult{
                code...
                return {
                    render,
                    staticRenderFns
                }
            }
       }

### 2:当createed执行完成以后，就需要解析当前html模板，生成虚拟dom

#### 1: 执行<a href="">compileToFunctions</a>函数，传入template(模板字符串)、<a href="#">compilerOptions(解析配置)</a>、vm(当前组件实例)进行解析html。

#### 2：在compileToFunctions函数中执行<a href="">compile</a>函数，用来合并<a href="#">baseOptions</a>和CompilerOptions
    合并后的finalOptions
    {
        CompileOptions,
        __proto__:指向baseOptions
    }
    
#### 3：在compile函数中调用<a href="">baseCompile</a>函数，传入template(模板字符串)，合并后的对象finalOptions作为参数。
        
#### 4:在baseCompile函数中调用<a href="#">parse</a>函数。