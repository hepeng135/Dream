
## v-for

#### 函数的主要作用
    1：通过getAndRemoveAttr函数获取v-for的表达式，并从el.attrsList中删除对应项。
    2：parseFor解析v-for表达式,返回res。 eg: item for message
        {
            for: 数据源 message
            alias ：循环时当前项 item
            iterator1 : key  当前项的名称   jsonKey 或者 arrIndex
            iterator2 : index 当前项的index
        }
    3：extend: 将res上的属性添加到 el上

```
export function processFor (el: ASTElement) {
    let exp
    //从el.attrsMap上获取对应的属性值，并从el.attrsList中删除对应的项
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
        解析出v-for的表达式
        const res = parseFor(exp)
        if (res) {
            extend(el, res)
        } 
    }
}

```

## v-if
#### 函数的主要作用
    1:getAndRemoveAttr函数获取v-if的表达式，并从attrsList中删除该项
    2：如果有ifExpression表达式则在el上添加属性 
        el.if:ifExpression=ifExpression
        el.ifConditions.push({
            exp: ifExpression,
            block: el
        })
    3:如果没有v-if,则看是否拥有else 和 v-else-if,并添加属性
        el.else:true or false
        el.elseif=elseifExpression
    
```
function processIf (el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
    addIfCondition(el, {
      exp: exp,
      block: el
    })
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}
```
## v-once
#### 函数作用
    1：getAndRemoveAttr函数从el的attrsMap上获取v-once对应的value值，并从attrList上删除对应项   
    2：el上添加once属性，值为true
``` 
function processOnce (el) {
    const once = getAndRemoveAttr(el, 'v-once')
    if (once != null) {
        el.once = true
    }
}
```




## :key / v-bind:key 

#### 函数的主要作用
    1：获取key的表达式，并进行解析，有过滤器的话同时解析过滤器
    2：对key不能用在的地方进行错误提示
        a):不能在template上使用
        b)：当放弃循环的元素的父级为transition-group时，key不能为 循环的key或者index
    
    3：给当前el上增加key属性最为标识
```
function processKey (el) {
    //从el上获取key这个属性的表达式，并对过滤器进行解析
    const exp = getBindingAttr(el, 'key')
    if (exp) {
       
        if (process.env.NODE_ENV !== 'production') {
            //错误提示判断：template上不能用key
            if (el.tag === 'template') {
                warn(
                `<template> cannot be keyed. Place the key on real elements instead.`,
                getRawBindingAttr(el, 'key')
                )
            }
            if (el.for) {
            //当放弃循环的元素的父级为transition-group时，key不能为 循环的key或者index
                const iterator = el.iterator2 || el.iterator1
                const parent = el.parent
                if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
                    warn(
                    `Do not use v-for index as key on <transition-group> children, ` +
                    `this is the same as not using keys.`,
                    getRawBindingAttr(el, 'key'),
                    true /* tip */
                    )
                }
            }
        }
        el.key = exp
    }
}

```

## :ref / v-bind:ref 
#### 函数的主要作用 
    1:获取key的表达式，并进行解析，有过滤器的话同时解析过滤器
    2：el上添加ref属性，作为标识
    3：el上添加refInFor属性，标识当前ref是否在v-for中   true or false
```
function processRef (el) {
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    //checkInFor：判断当前el带有v-for指令或者el的父辈有
    el.refInFor = checkInFor(el)
  }
}

```
## 解析slot slot-scope v-slot
#### 插槽与作用域插槽 slot scope  slot-scope 已废弃的语法

    定义的时候  <div> <slot name="header" :message="message"></slot></div>
    
    调用的时候  <component-name><header slot-scope="{message}" slot="header">{{message}}</header></component-name>
    或  <component-name><template scope="{message}" slot="header"><header>{{message}}</header></template></component-name>

#### 插槽与作用域插槽 slot v-slot 新增语法 

    定义的时候 <div> <slot name="A" :about="about"></slot> </div>   
    
    调用的时候 <component-name><template v-slot:A="{about}"><p>{{about}}</p></template></component-name>

#### processSlotContent函数的作用，解析 scope  slot-scope  v-slot
    1：解析 slot scope  scope-slot
        el.slotScope : 当前插槽的的作用域  
        el.slotTarget :当前插槽的名字
        el.slotTargetDynamic 当前插槽的值是静态（false）还是动态绑定(true)
        如果当前不是template并且没有启用插槽作用域，则直接想el.attrsList中添加 {slotName,slotVal,start,end,dynamic:undefined}
       
    2:解析 v-slot:slotName=slotScope
        el为template时
            el.slotScope : 当前插槽的的作用域  
            el.slotTarget :当前插槽的名字
            el.slotTargetDynamic 当前插槽的值是静态（false）还是动态绑定(true)
        el为组件的时候
            el.plain:false
            el.scopedSlots：{slotName：{
                slotTarget，
                slotTargetDynamic，
                slotScope，
                ..其他为el.chidren上的一些属性，子集没有slotScope
            }}
            
       
```
function processSlotContent (el) {
    let slotScope
    
    //处理插槽作用域
    //scope 插槽的作用域只能挂载到template上
    if (el.tag === 'template') {
        //获取作用scope对应的表达式
        slotScope = getAndRemoveAttr(el, 'scope')
        //兼容slot-scope
        el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) { 
        //获取slot-scope，slot-scope可以挂载任何元素上，包括template
        el.slotScope = slotScope
    }
    
    //处理具名插槽
    //获取静态或者绑定的slot属性，具名插槽。
    const slotTarget = getBindingAttr(el, 'slot');
    if (slotTarget) {
        //当前slotTarget是否为空，则认为是default
        el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget ;
        //当前slot是否绑定值
        el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot'])
        //如果当前el不是template 并且没有插槽作用域，则向attr添加一份slot的属性信息，dynamic：表示当前的具名是静态的
        if (el.tag !== 'template' && !el.slotScope) {
            //向attr上添加slot属性的json  attr.push({name,value,start,end,dynamic:undefined})
            addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
        }
    }

    //处理最新的v-slot,
    //当当前v-slot挂载在template上时
    if (el.tag === 'template') {
        // v-slot on <template>
        //处理具名插槽
        //getAndRemoveAttrByRegex函数从el.attrList中通过正则获取name为v-slot所在的属性json
        const slotBinding = getAndRemoveAttrByRegex(el, slotRE)
        if (slotBinding) {
            //getSlotName：通过正则从slotBinding.name中获取具名插槽的名字
            //通过正则获取当前这个name是否静态值还是绑定值
            // dynamic：true  or false    动态绑定 or 静态
            const { name, dynamic } = getSlotName(slotBinding)
            
            //el上挂载 
            //slotTarget：插槽具名名字   
            //slotTargetDynamic：插槽名是否动态
            //slotScope :具名插槽的作用域，没有的话设置为  _empty_ ；
            el.slotTarget = name
            el.slotTargetDynamic = dynamic
            el.slotScope = slotBinding.value || emptySlotScopeToken // force it into a scoped slot for perf
        }
    } else {
        //当v-slot挂载在当前组件上时
        //从attrList上获取v-slot对应的信息
        const slotBinding = getAndRemoveAttrByRegex(el, slotRE)
        if (slotBinding) {
            
            //获取el上的作用域插槽集合，默认为{}
            const slots = el.scopedSlots || (el.scopedSlots = {})
            //获取插槽的名字以及是否绑定状态
            const { name, dynamic } = getSlotName(slotBinding)
            
            //以el为父级，创建一个template元素，并且添加到 el.scopedSlots.slotName上
            const slotContainer = slots[name] = createASTElement('template', [], el)
            //设置template的插槽名称
            slotContainer.slotTarget = name
            //插槽名称的绑定状态
            slotContainer.slotTargetDynamic = dynamic
            
            //循环el的child,当前没有作用域的child将添加到template.children中
            slotContainer.children = el.children.filter((c: any) => {
                if (!c.slotScope) {
                    c.parent = slotContainer
                    return true
                }
            })
            //设置template这个插槽的作用域
            slotContainer.slotScope = slotBinding.value || emptySlotScopeToken
            
            
            el.children = []
            // mark el non-plain so data gets generated
            el.plain = false
        }
    }
}

```    
#### processSlotOutlet：解析slot标签,el.slotName=slotName

```
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
  }
}

```

## is / v-bind:is  / :is
#### processComponent函数处理组件上的 is 属性 和 inline-template属性
    el.component=isExpression
    el.inline-template=true
```
function processComponent (el) {
    let binding
    if ((binding = getBindingAttr(el, 'is'))) {
        el.component = binding
    }
    if (getAndRemoveAttr(el, 'inline-template') != null) {
        el.inlineTemplate = true
    }
}

```