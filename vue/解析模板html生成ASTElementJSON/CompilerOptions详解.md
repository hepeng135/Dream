#### CompilerOptions [Object]

#### 简介：当前解析html模板字符串时用到的工具类函数集合。通过参数传给parse函数


#### 实例属性或方法
    outputSourceRange:当前的开发环境。 true ：开发   false：生产  （我们看源码默认为true，此属性可以忽略）
    
    shouldDecodeNewlines：在标签元素的属性中增加换行符是否会被编码，IE中的换行会被编码（测试后是这样的）
    
    shouldDecodeNewlinesForHref：在href中增加换行符是否会被编码，Chrome中换行会被编码（测试后没出现这种现象）
    
    delimiters 当前纯文本插入分隔符，默认 ["{{"，"}}"]

    warn:错误处理函数，请忽略


#### 原型属性或方法

    expectHTML: true
    modules: (3) [{…}, {…}, {…}]
    directives: {model: ƒ, text: ƒ, html: ƒ}
    isPreTag: ƒ (tag)
    isUnaryTag: ƒ (val)
    mustUseProp: ƒ (tag, type, attr)
    canBeLeftOpenTag: ƒ (val)
    isReservedTag: ƒ (tag)
    getTagNamespace: ƒ getTagNamespace(tag)
    staticKeys: "staticClass,staticStyle"
    
    
    expectHTML<Boolean>:true 常量，一直为true，表示模板传入的是html
    
    modules<Array>:[classObj,styleObj,modelObj]
        classObj<Object>:
            staticKeys<Array>:['staticKeys']  常量
            transformNode<Function>:处理静态class和绑定class,将对应的值解析出来挂载到el.staticClass和classBinding上
            genData<Function>:将staticClass和classBinding用字符串连接起来
            
        styleObj<Object>:
            staticKeys<Array>:['staticStyle'] 常量
            transformNode:和上面处理class的一样
            genData：和上面处理class一样
    
        modelObj<Object>:
            preTransformNode:处理input标签，
    
#### classObj.transformNode函数详解
```
function transformNode (el: ASTElement, options: CompilerOptions) {
    
    const warn = options.warn || baseWarn
    
    //getAndRemoveAttr：获取class属性对应的值，并从el.attrsList中删除对应class项
    const staticClass = getAndRemoveAttr(el, 'class')
  
    //向el中添加staticClass属性
    if (staticClass) {
        el.staticClass = JSON.stringify(staticClass)
    }
    //getBindingAttr：获取动态绑定class的表达式，并解析出里面的过滤器
    /*
        1:getAndRemoveAttr获:class的表达式，并从el.attrsList中删除对应的:class项
        2：parseFilters：解析表达式中的过滤器
        处理后的结果：
        没有过滤器  message
        一个过滤器  f("filter1")(expression,arg1,arg2,...)
        多个过滤器  f("filter2")(f("filter1")(expression,arg1,arg2,...),arg1,arg2,....)

    */
    const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
    //向el中添加classBinding属性
    if (classBinding) {
        el.classBinding = classBinding
    }
}
```

#### modelObj.transformNode 函数详解

```
function preTransformNode (el: ASTElement, options: CompilerOptions) {
    //判断当前是input标签
    if (el.tag === 'input') {
        const map = el.attrsMap
        //确定是否拥有v-model这个属性
        if (!map['v-model']) {
            return
        }
    
        let typeBinding
    
        //获取type绑定的表达式，并解析除表达式的过滤器。"_f("add")(item['type'])" （add为过滤器）
        if (map[':type'] || map['v-bind:type']) {
            typeBinding = getBindingAttr(el, 'type')
        }
        //如果没有type这个属性，则自己新增一个
        if (!map.type && !typeBinding && map['v-bind']) {
            typeBinding = `(${map['v-bind']}).type`
        }
    
        if (typeBinding) {
            ////获取v-if的表达式vIfExpression，并从el.attrsList、el.attrsMap中移除
            const ifCondition = getAndRemoveAttr(el, 'v-if', true)

            //将v-if的表达式处理成  &&(vIfExpression)            
            const ifConditionExtra = ifCondition ? `&&(${ifCondition})` : ``
    
            //获取v-else的表达式 并从el.attrsList、el.attrsMap中移除。
            const hasElse = getAndRemoveAttr(el, 'v-else', true) != null

            //获取v-else-if的表达式 并从el.attrsList、el.attrsMap中移除。
            const elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true)
            
            // 1. 创建一个input标签对象，依赖原有的el，同原来的el享有同一个父级
            const branch0 = cloneASTElement(el)
            
            // 解析v-for，向当前的标签json中添加
            //for：message (当前数据源) 、
            //alias：item (当前项数据)
            // iterator1 : key  当前项的名称   jsonKey 或者 arrIndex  (如果有的话)
            //iterator2 : index 当前项的index  (如果有的话)
            processFor(branch0)
           
            //添加一组属性 type：checkBox, branch0.attrsList、branch0.attrsMap 中都添加呢
            addRawAttr(branch0, 'type', 'checkbox')
            
            //处理其他的一些属性
            processElement(branch0, options)
            
            branch0.processed = true // prevent it from double-processed
    branch0.if = `(${typeBinding})==='checkbox'` + ifConditionExtra
    addIfCondition(branch0, {
    exp: branch0.if,
    block: branch0
    })
    // 2. add radio else-if condition
    const branch1 = cloneASTElement(el)
    getAndRemoveAttr(branch1, 'v-for', true)
    addRawAttr(branch1, 'type', 'radio')
    processElement(branch1, options)
    addIfCondition(branch0, {
    exp: `(${typeBinding})==='radio'` + ifConditionExtra,
    block: branch1
    })
    // 3. other
    const branch2 = cloneASTElement(el)
    getAndRemoveAttr(branch2, 'v-for', true)
    addRawAttr(branch2, ':type', typeBinding)
    processElement(branch2, options)
    addIfCondition(branch0, {
    exp: ifCondition,
    block: branch2
    })
    
    if (hasElse) {
    branch0.else = true
    } else if (elseIfCondition) {
    branch0.elseif = elseIfCondition
    }
    
    return branch0
    }
    }
}

```
