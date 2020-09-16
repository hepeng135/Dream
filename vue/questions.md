1：template,$mount,render之间的区别？


2：vue中extend和component之间的关系？


3：Vue中内部的组件<keep-live></keep-live>等,与我们组件创建的组件有什么区别。

4：从代码层面去结束watch 与 component的区别 


5：Vue1到Vue2的变化

Vue1：在变化侦测上，直接精确到呢相关dom，当一个属性状态发生变化时，我们需要更新对应的所有dom，这样就造成内存的开销很大。

Vue2: 引入虚拟DOM，属性的状态对应的依赖不在直接精确到DOM节点，而是一个组件，当状态改变时，会通知这个组件进行更新，组件内部将新旧
虚拟DOM进行对比，大大降低依赖数量，从而降低依赖追踪所消耗的内存。


6:dep在属性getter时收集watcher，watcher：在数据发送setter时既数据发送变、化时通知他，他在通知其他地方进行更新


7：Vue2中的数据侦测
    
(1)对于Object类的数据，我们采用的是用Object.defineProperty去定义getter(收集依赖)、setter(触发依赖)
    
(2）对于Array类的数据，采用的方式是重写一些数组方法。（push pop unshift shift splice sort reverse）

     ```
        const arrProto=Array.prototype; //获取Array的原型对象
        const arrayMethods=Object.create(arrProto);  //以Array的原型对象作为原型创建arrayMethods
        
        ['push','pop','unshift','shift','splice','sort','reverse'].forEach(function(method){
            cost original=arrayMethods[method]; //缓存原生方法
            Object.defineProperty(arrayMethods,method,{
                value:function mutator(...args){
                    return original.apply(this,args);
                }
            })
        })
        //为呢不响应所有的数组，只给需要添加拦截器的数组添加。
        //兼容处理
        if('__proto__' in value){
            value._proto__=arrayMethods;
        }else{
            let keys=Object.getOwnPropertyNames(arrayMethods)
            for(let i=0;i<keys.length;i++){
                value[keys[i]]=arrayMethods[keys[i]]
            }
        }
        
        
     
     ```

