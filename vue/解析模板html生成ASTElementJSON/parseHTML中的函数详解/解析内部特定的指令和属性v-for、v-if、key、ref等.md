
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
    3:如果没有v-if,则看是否拥有else 或者 v-else-if,并添加属性
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

## 插槽与作用域插槽 slot  slot-scope 已废弃的语法

    定义的时候  <div> <slot name="header" :message="message"></div></div>
    
    调用的时候  <component-name><header slot-scope="{message}" slot="header">{{message}}</header></component-name>


## 插槽与作用域插槽 slot v-slot 新增语法

    定义的时候 <div> <slot name="A" :about="about"></slot> </div>   
    
    调用的时候 <component-name> <p v-slot:A="{about}">{{about}}</p> </component-name>