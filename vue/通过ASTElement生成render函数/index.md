
generate:生成器，将编译得到的ASTElement生成为一个render函数
```
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}

```
CodegenState：创建CodegenState实例，创建一个生成器的配置对象
       
```
    this.options = options
    //获取class和style的处理,字符串链接
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    //将公共指令model,text,html与bind on model 三种绑定模式处理进行合并
    this.directives = extend(extend({}, baseDirectives), options.directives)
    const isReservedTag = options.isReservedTag || no
    this.maybeComponent = (el: ASTElement) => !!el.component || !isReservedTag(el.tag)
    this.onceId = 0
    this.staticRenderFns = []
    this.pre = false
```
//循环递归生成
```
function genElement (el: ASTElement, state: CodegenState): string {
    if (el.staticRoot && !el.staticProcessed) { //如果当期是静态父级并且还没有进行处理
        return genStatic(el, state)
    }
    if (el.once && !el.onceProcessed) { //处理v-once指令
         return genOnce(el, state)
    }
    
}
```


//处理静态属性和静态标签
```
genStatic(el: ASTElement, state: CodegenState){
    state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
}
```
//处理v-once指令
```
function genOnce (el: ASTElement, state: CodegenState): string {
    el.onceProcessed = true
    if (el.if && !el.ifProcessed) {
        return genIf(el, state)
    } else if (el.staticInFor) {//v-once和v-for一起用的时候必须存在key
        let key = ''
        let parent = el.parent
        while (parent) {
            if (parent.for) {
                key = parent.key
                break
            }
             parent = parent.parent
        }
        if (!key) {
            return genElement(el, state)
        }
        return `_o(${genElement(el, state)},${state.onceId++},${key})`
    } else {
        return genStatic(el, state)
    }
}
```

v-for的处理
```
  return `${altHelper || '_l'}((${exp}),` +
     `function(${alias}${iterator1}${iterator2}){` +
       `return ${(altGen || genElement)(el, state)}` +
     '})'

```
v-if处理

```
export function genIf (el: any,state: CodegenState,altGen?: Function,altEmpty?: string): string {
  el.ifProcessed = true // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}
//递归生成三目运算符
function genIfConditions (conditions: ASTIfConditions,state: CodegenState,altGen?: Function,altEmpty?: string): string {
     if (condition.exp) {
        return `(${condition.exp})?${
          genTernaryExp(condition.block)
        }:${
          genIfConditions(conditions, state, altGen, altEmpty)
        }`
      } else {
        return `${genTernaryExp(condition.block)}`
      }
    //处理v-once和v-if组合时
    function genTernaryExp (el) {
        return altGen
          ? altGen(el, state)
          : el.once
            ? genOnce(el, state)
            : genElement(el, state)
    }
}
```
//处理children

```
//v-for
 if (children.length === 1 &&
      el.for &&
      el.tag !== 'template' &&
      el.tag !== 'slot'
    ) {
      return `${(altGenElement || genElement)(el, state)}${normalizationType}`
}else{
     return `[${children.map(c => gen(c, state)).join(',')}]${
          normalizationType ? `,${normalizationType}` : ''
        }`
}

```

//

