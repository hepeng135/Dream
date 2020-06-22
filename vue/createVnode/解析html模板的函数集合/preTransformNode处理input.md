//处理input标签

```
function preTransformNode (el: ASTElement, options: CompilerOptions) {
  if (el.tag === 'input') {
    const map = el.attrsMap //获取attrMap这个集合
    if (!map['v-model']) {//如果当前没有v-model这个属性则直接return
      return
    }

    let typeBinding  //当前type的绑定值

    //解析当前type的表达式，返回表达式，有过滤器则一起处理返回
    //return [String]  message  或者  f("filterName")(message,arg1,agr2)
    if (map[':type'] || map['v-bind:type']) {
      typeBinding = getBindingAttr(el, 'type')
    }
    //
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
     
      //深拷贝一份el对象，与el不同在于，没有拷贝rawAttrsMap
      const branch0 = cloneASTElement(el)
      // 解析v-for,向el上添加从v-for中解析出的属性
      processFor(branch0)
      //添加一组属性 type：checkBox, branch0.attrsList、branch0.attrsMap 中都添加呢
      addRawAttr(branch0, 'type', 'checkbox')
      // 解析特殊属性  key ref is slot  slot-scope scope
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