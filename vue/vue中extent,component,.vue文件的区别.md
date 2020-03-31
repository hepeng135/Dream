## Vue.extend(options) 
vue中的全局API之一

 参数：{Object} options ,一些vue选项如template、data、methods、props、computed、watch等
 
 用法：
 ```
    let exampleComponent=Vue.extend({
        template:'<p @click="doSomething">{{message}}</p> ',
        data(){
            return {message:'1111'}
        },
        methods:{
            doSomething(){
                //.....
            }
        }
    })
 ```
 结果：返回一个组件的构造函数。
 创建实例，并挂载到一个元素上。
 new ExampleComponent
    
    
    





## Vue.component
    