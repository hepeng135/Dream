



需要特殊处理的一些属性   style  class  v-model  v-if v-for v-pre   



## 一个成对标签解析的过程  

    eg: <div>{{mess}}</div>

#### 处理开始标签```<div>``` 以及上面带一些属性
 1：parseStartTag 函数获取 match出 tagName attrs 以及便签开始位置，结束位置，以及每个属性的开始位置以及结束位置 
 2: handleStartTag 函数 将上面匹配出来的 attrs整理成一个attrsList
    {name:attrName,value:attrVal,start:attrStart,end:attrEnd}
    
 3: start 函数
    a):根据上面标签的信息创建一个elJson，然后处理v-pre、v-for、v-if、v-once这些特殊指令，并在elJson上挂载对应的处理结果。
    b):确定当前便签的最外层父级，以及默认当前标签拥有子属性，将其作为最近的父级(currentParent)
     
    {
        type <Number> : 1  标签类型，元素标签
        tag <String> : tagName  标签名
        attrsList <Array [{name,value,start,end},...] > ：属性列表
        attrsMap <Object {name:value,}...> : 属性名和属性值组成的json键值对
        rawAttrsMap <Object {name:attrsNameList,....} >：由attrsList循环生存.
        
        parent <Object> : elParent 当前标签的父级
        
        children <Array>: [] 当前标签的子集
    } 
    
 
#### 处理标签中的文本节点（字符、表达式）或者空白节点
      1：首先确定空白的结束位置，并从html中取出
        let text, rest, next
        if (textEnd >= 0) {
            rest = html.slice(textEnd)
           //检测当前rest一直都是纯文本形式
            while (
                !endTag.test(rest) && //不是结束标签
                !startTagOpen.test(rest) && //不是开始标签
                !comment.test(rest) &&  //不是注释
                !conditionalComment.test(rest)//不是Ie判断
            ) {
                //获取下一个next出现的位置
                next = rest.indexOf('<', 1)
                if (next < 0) break
                textEnd += next //更新当前<出现的位置
                rest = html.slice(textEnd)//更新rest
            }
            //获取所有的文本节点
            text = html.substring(0, textEnd)
        }
      2：  