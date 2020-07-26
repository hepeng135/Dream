
html模板如下

    <div>{{state}}</div>
    <div class="app">
        <p>{{state}}</p>
        <button @click="eventClick">增加</button>
    </div>
    
    
组件选项如下

    data(){
        return {
            state:1
        }
    },
    methdos:{
        eventClick(){
            this.state++;
        }
    }
    
通过解析器得到的ASTElement

    {
        type: 1,
        tag: "div",
        attrsList: [],
        attrsMap: {class: "app"},
        rawAttrsMap: {class: {name: "class", value: "app", start: 5, end: 16}},
        parent: undefined,
        children:[
            {type: 1,tag: "p",attrsList: [], attrsMap: {},rawAttrsMap: {},parent: 上一级的引用
                children: [{type: 2,expression: "_s(state)",tokens: [{@binding: "state"}],text: "{{state}}",start: 29,end: 38}]
                start: 26,end: 42,plain: true},
            {type: 3, text: " ", start: 42, end: 51}
            {type: 1,tag: "button",
                attrsList: [{name: "@click", value: "eventClick", start: 59, end: 78}],attrsMap: {@click: "eventClick"},
                rawAttrsMap: {@click: {name: "@click", value: "eventClick", start: 59, end: 78}},
                parent: 上一级的引用,
                children: [{type: 3, text: "增加", start: 79, end: 81}],
                start: 51,end: 90,plain: false,hasBindings: true,
                events: {click: {value: "eventClick", dynamic: false, start: 59, end: 78}}
            }
        ]
        start: 0
        end: 101
        plain: false
        staticClass: ""app"
    }
    
通过生成器得到如下字符串
    
    "with(this){return _c('div',
        {staticClass:"app"},
        [
            _c('p',[_v(_s(state))])
            ,_v(" "),
            _c('button',{on:{"click":eventClick}},[_v("增加")])
        ])
    }"
    //在通过new Function()去创建 render渲染器
    vm.$options.render：非静态模板的render渲染器
    vm.$options.staticRenderFns:纯静态模板的render渲染器
    
通过 vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)  挂载vm._c 这个函数,创建vnode


调用beforeMount生命周期钩子函数 

定义updateComponent函数,更新组件
    
    //vm._render():调用当前组件实例上的原型方法 _render
    let updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }

实例化Watcher,为当前的组件提供一个watcher,调用pushTarget（确定Dep.target=watcher实例）、调用updateComponent函数
      
     new Watcher(vm, updateComponent, noop, {
        before () {
          if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
          }
        }
     }, true /* isRenderWatcher */)
    
    //实例Watcher时，Watcher会初始化一些属性，调用原型上的get方法 
    function Watcher(){
        //初始化一些数据
        code....
        this.getter=typeof updateComponent==='function' ? updateComponent : parsePath(expOrFn)
        this.value=this.lazy ? undefined : this.get();
    }
       
    Watcher.prototype.get= () {
        //pushTarget函数：targetStack.push(this);Dep.target=this
        //给Dep.target赋值当前Watcher的实例
        pushTarget(this)
        let value
        const vm = this.vm
        try {
            调用updateComponent函数，内部this转换成当前组件对象this
            value = this.getter.call(vm, vm)
        } catch (e) {
            if (this.user) {
                handleError(e, vm, `getter for watcher "${this.expression}"`)
            } else {
                throw e
            }
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value)
            }
            popTarget()
            this.cleanupDeps()
        }
        return value
    }
    
    
调用updateComponent 首先调用 vm._render方法
    
    vm._render:Vue原型上的一个方法，有以下作用
        const { render, _parentVnode } = vm.$options
        1：确定vm.$vnode=_parentNode;
        2: 调用 vnode = render.call(vm._renderProxy, vm.$createElement) 生成vnode
        
        
 
    