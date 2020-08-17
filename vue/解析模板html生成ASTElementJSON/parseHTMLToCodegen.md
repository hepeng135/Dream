
## el上的特殊标识

    plain: 是否简易的元素  true or false  
    判断根据 el.plain=(!el.key && !el.scopedSlots && !el.attrsList.length)
    
    static：是否一个静态元素 true or false
    判断根据  
        el.type===2(带有表达式的文本节点)  false
        el.type===3(纯文本节点)   true
        el.pre  拥有v-pre指令
        (
            !node.hasBindings && // 不存在自定义的绑定属性
            !node.if && !node.for && // 没有 v-if v-else-if  v-for 这些指令
            !isBuiltInTag(node.tag) && // not a built-in// 当前el是component 或者slot
            isPlatformReservedTag(node.tag) &&  //当前标签属于html标签或者svg标签 中的一种
            !isDirectChildOfTemplateFor(node) &&  //isDirectChildOfTemplateFor函数当前el的没有父级 false   当前el的父级不是template标签时 false   当前el的父级有for时 true
            Object.keys(node).every(isStaticKey)
        ))
        
    staticRoot:当前el下所有的子集的static都是true，否则false

## slot 解析 （插槽，作用域域插槽）

组件代码

    <div>
        <component-name>
            <template slot="slot1" slot-scope="mess">
                <div>1111</div>
            </template>
            <div slot="slot2"></div>    
        </component-name>
    </div>

解析成 ASTElement

    {
        type:'1',
        tag:'component-name',
        children:[
            type:'1',
            tag:'div',
            attrsMap: {slot: "slot2"},
            slotTarget: ""slot2"",
            slotTargetDynamic: false,
            children:[文本节点]
        ],
        scopedSlots:{
            slot1:{
                type:'1',tag:'template',attrsList:[],
                attrsMap:{slot: "slot1", slot-scope: "mess"},
                rawAttrsMap:{slot:{name: "slot", value: "slot1",start,end},slot-scope:{name: "slot-scope", value: "mess",start,end}},
                children:[pAstElementsJson],
                slotScope: "mess",
                slotTarget: ""slot1"",
                slotTargetDynamic: false,
            }
        }
    }
    
生成器，生成函数

     "with(this){
        return _c('div',{staticClass:"app"},
            [
                _c('component-json', {
                        scopedSlots:_u([{
                                key:"slot1",
                                fn:function(mess){
                                    return [_c('p',[_v(_s(mess))])]
                                }
                        }])
                    },
                    [
                        _v(" "),
                        _c('div',{
                                attrs:{
                                    "slot":"default"
                                },
                                slot:"default"
                            },
                            [_v(_s(title))]
                        )
                    ]
                )
            ],
            1
        )
     }"
     
     
 ## v-if 系列解析
 
组件代码
    
    <div class="app">
        <p v-if="state==1">11111</p>
        <span v-else-if="state==2">22222</span>
        <b v-else>33333</b>   
    </div> 
     
     data(){
        return {state:1}
     }
 
解析成ASTElement

    {
        type:1,
        tag:'div',
        attrsList:[],
        attrsMap:{class:'app'},
        rawAttrsMap:{class: {name: "class", value: "app", start, end}}
        plain: false
        staticClass: ""app""
        static: false
        staticRoot: false
        children:[
            {
                type:1,tag:'p',attrsList:[],attrsMap:{v-if:'state==1'},
                rawAttrsMap:{v-if:{name: "v-if", value: "state==1", start, end}},
                parent:指向当前标签的parent
                if:'state==1',
                ifConditions:[
                    {exp:'state==1',block:{type:1,tag:'p',.....v-if所在标签p的解析}},
                    {exp:'state==2',block:{type:1,tag:'span',.....v-else-if所在标签span的解析}},
                    {exp:undefined,block:{type:1,tag:'b',.....v-else所在标签b的解析}}
                ]
            }
        ]
    }
 
生成器，生成函数
 
    "with(this){
        return _c('div',{staticClass:"app"},
        [
            (state==1)?
            _c('p',[_v("11111")]):
            (state==2)?
            _c('p',[_v("2222")]):
            _c('p',[_v("33333")])
        ]
    )}"
    
## v-for 组件代码
组件代码

    <div class="app">
        <p v-for="item in messData" :key="item.id">{{item.title}}</p>
    </div>
    
    data(){
        return {
            messData:[
              {id:'1',title:'111'},
              {id:'2',title:'2222'},
              {id:'3',title:'3333'}
            ],
        }
    }
解析成ASTElement

    {
        type:1,
        tag:'div',
        attrsList:[],
        attrsMap:{class:'app'},
        rawAttrsMap:{class: {name: "class", value: "app", start, end}}
        plain: false
        staticClass: ""app""
        static: false
        staticRoot: false
        children:[
            {
                type:1,tag:'p',attrsList:[],
                attrsMap:{v-for: 'item in messData', :key: 'item.id'}
                rawAttrsMap:{
                    v-for:{name:'v-for',value:'item in messData',start,end}
                    :key:{name:':key',value:'item.id',start,end}
                },
                for:'messData',
                alias:'item',
                key:'item.id',
                iterator1:'key',
                iterator2:'index',
                plain:false,
                static:false,
                start,
                end,
                parent:指向当前父级
                children:[
                    type:'2',
                    expression:'_s(item.title)',
                    tokens:[{@binding:'item.title'}],
                    text:'{{item.title}}',
                    static:false,
                    start,
                    end
                ]
            }
        ]
    }
    
生成器，生成函数

    "with(this){
        return _c('div',
            {staticClass:"app"},
            _l((messData),function(item,key,index){
                return _c('p',
                    {key:item.id},
                    [_v(_s(item.title))]
                )
            })
            ,0
        )
    }"


## v-model

解析成ASTElement
    
    //大致和上面的一样，有以下几项的区别,v-model作为治理
    v-dierctiveName:arg.a="message"   v-dierctiveName:[arg].a="message"  
    //arg : 指令的参数 ，isDynamicArg：当前参数是否动态的  modifiers:修饰符 {a:true} 
    {
        type:1,
        tag:'input',
        .....
        directive:[
            {name:'model',rawName:'v-model',value:'message',arg,isDynamicArg,modifiers,start,end}
        ]
        //input的type为绑定时，会默认添加一个ifConditions属性，同v-if
        ifConditions:[
            {exp:"(type==='checkBox')",block:elCheckBox}
            {exp:"(type==='radio')",block:elRadio}
            {exp:undefined,block:el}
        ]
    }
    
生成器
    
    "with(this){
        return _c('div',{staticClass:"app"},
        [
            ((type)==='checkbox')?
            _c('input',{
                directives:[{name:"model",rawName:"v-model",value:(message),expression:"message"}],
                attrs:{"type":"checkbox"},
                domProps:{"checked":Array.isArray(message)?_i(message,null)>-1:(message)},
                on:{"change":function($event){
                    var $$a=message,$$el=$event.target,$$c=$$el.checked?(true):(false);
                    if(Array.isArray($$a)){
                        var $$v=null,$$i=_i($$a,$$v);
                        if($$el.checked){
                            $$i<0&&(message=$$a.concat([$$v]))
                        }else{
                            $$i>-1&&(message=$$a.slice(0,$$i).concat($$a.slice($$i+1)))
                        }
                    }else{
                        message=$$c
                    }
                }}
            }):
            ((type)==='radio')?
            _c('input',{
                directives:[{name:"model",rawName:"v-model",value:(message),expression:"message"}],
                attrs:{"type":"radio"},
                domProps:{"checked":_q(message,null)},
                on:{"change":function($event){
                    message=null
                }}
            }):   
            _c('input',{
                directives:[{name:"model",rawName:"v-model",value:(message),expression:"message"}],
                attrs:{"type":type},
                domProps:{"value":(message)},
                on:{"input":function($event){
                    if($event.target.composing)return;
                    message=$event.target.value
                }}
            })
        ])
    }"
     
   
    

## v-text、v-html、v-show、v-on(@)、v-bind(:)、v-pre、v-cloak、v-once
组件代码

    <p @click="eventClick" @emitEvent="emitEvent" :a="title" b="title" v-html="message | add" v-once class="test" :class="{box:isActive}" style="color: #0000FF" :style="{fontSize:'12px',background:red}"></p>
    
    data(){
        return {
            title:'props',
            message:'主组件Vue',
            isActive:'className',
            red:'red',
        }
    }
    methods:{
        eventClick(){
            this.state++;
        },
        emitEvent(st){
            console.log(st)
        }
    },
    filters:{
        add(val){console.log(val);return val+'222'} 
    }
    
解析成ASTElement

    {
        type:1,tag:'p',
        attrsList:[
            {name: "@click", value: "eventClick", start: 590, end: 609},
            {name: "@emitevent", value: "emitEvent", start: 610, end: 632},
            {name: ":a", value: "title", start: 633, end: 643},
            {name: "b", value: "title", start: 644, end: 653},
            {name: "v-html", value: "message", start: 654, end: 670}
        ],
        attrsMap:[
            @click: "eventClick", @emitevent: "emitEvent",:a: "title", b: "title",
            v-html: "message", v-once: "",class: "test",:class: "{box:isActive}",style: "color: #0000FF",:style: "{fontSize:'12px',background:red}",
        ],
        rawAttrsMap:{
            @click: {name: "@click", value: "eventClick", start: 590, end: 609},
            @emitevent: {name: "@emitevent", value: "emitEvent", start: 610, end: 632},
            :a: {name: ":a", value: "title", start: 633, end: 643},
            b: {name: "b", value: "title", start: 644, end: 653},
            v-html: {name: "v-html", value: "message", start: 654, end: 670},
            v-once: {name: "v-once", value: "", start: 671, end: 680},
            class: {name: "class", value: "test", start: 681, end: 693},
            :class: {name: ":class", value: "{box:isActive}", start: 694, end: 717},
            style: {name: "style", value: "color: #0000FF", start: 718, end: 740},
            :style: {name: ":style", value: "{fontSize:'12px',background:red}", start: 741, end: 782}
        },
        events:{
            click: {value: "eventClick", dynamic: false, start: 590, end: 609}
            emitevent: {value: "emitEvent", dynamic: false, start: 610, end: 632}
        }
        attrs:[
            {name: "a", value: "title", dynamic: false, start: 633, end: 643}
            {name: "b", value: ""title"", dynamic: undefined, start: 644, end: 653}
        ]
        directives:[
            {name: "html", rawName: "v-html", value: "message", arg: null, isDynamicArg: false, modifiers,start,end}
        ],
        children:[
            {type:2,expression: "_s(_f("add")(message))",tokens:[{@binding: "_f("add")(message)"}],text: "{{message | add}}",static:false,start,end}     
        ],
        staticClass: ""test""
        classBinding: "{box:isActive}"
        staticStyle: "{"color":"#0000FF"}"
        styleBinding: "{fontSize:'12px',background:red}"
        static: false
        staticInFor: false
        staticRoot: false
        once: true
        plain: false
        hasBindings: true
    }
    
    
生成器，生成函数

    "with(this){return _c('p',{
            staticClass:"test",
            class:{box:isActive},
            staticStyle:{"color":"#0000FF"},
            style:({fontSize:'12px',background:red}),
            attrs:{"a":title,"b":"title"},
            domProps:{"innerHTML":_s(message)},
            on:{"click":eventClick,"emitevent":emitEvent}
        },
        [_v(_s(_f("add")(message)))]
    )}"