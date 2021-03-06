以以下的data为例
```
options._data={
    about:{
        name:'hepeng',
        age:'22',
    },
    arrData:[{id:'1',mess:'1'}]
}
```

1：数据代理：在initState-->initData中先用proxy函数进行代理，让Object.keys(options._data)中的key直接代理到组件实例上，运用defineProper进行
数据劫持，这样我们在实例上进行访问和操作属性key时，会直接代理反应到option.data中

2：数据劫持：在initState-->initData对对应的key进行数据劫持，递归操作。同时创建对应的Dep实例。
```

//以这个value创建一个Observer实例，并在里面创建一个Dep实例
{
about:{name,age},
arrData:[{id,mess}]
}
2,3,4,5
//Observer实例 =》
this.value;
this.dep=new Dep();
this.value.__ob__=this   //value添加一个__ob__属性指向当前Observer实例

原型方法
walk()  //给当前value下的所有key/value调用defineReactive

observeArray  //给当前value下的所有key/value调用observe


defineReactive(){

    let dep=new Dep();

    get: function reactiveGetter () {
        const value = getter ? getter.call(obj) : val;
        if (Dep.target) {  //Dep.target  组件中watcher的实例
            dep.depend()//想Dep.target中添加这个属性对应的dep实例
            if (childOb) {//如果这个属性对应的val是object或者array，则获取改val上的__ob__（指向这个val的dep实例）属性。
                childOb.dep.depend() //将对应val的dep实例添加到Dep.target中
                if (Array.isArray(value)) {
                    dependArray(value)
                }
            }
        }
        return value
    },
}


```

value.__ob__ 指向当前Observer实例：可访问当前value ， 当前value对应的dep实例

dep实例可访问  

this.subs=[watcher]   

this.depend  =>  Dep.target.addDep(this) ，

this.addSub  =>  this.subs.push(sub)


1：key:_data, value:{about},  调用observer ，实例化 Observer ，实例化Dep ,


2：key:about,value:{name,age}   实例化 Dep ， about添加 getter, 如果value为Object，再次调用observer 


3：key:name,value:'hepeng'    key:age,vlaue:'111'   分别实例化 Dep ， name和age添加getter，


4：在mountComponent中，创建Vnode之前实例化Watcher,一个组件对应一个watcher
    
    //初始化一些属性
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()

    //调用get原型方法。
    get(){
        pushTarget(this)  //给当前Dep.target赋值，targetStack中push这个watcher实例
        
        value = this.getter.call(vm, vm) //生成vnode，这里面会触发vm.options._data中的get方法，
        
    }
    
6：触发属性拦截器get,通过dep.depend(),将dep与watcher链接起来
    
    if (Dep.target) {  //Dep.target  组件中watcher的实例
        dep.depend()//想Dep.target中添加这个属性对应的dep实例
        if (childOb) {//如果这个属性对应的val是object或者array，则获取改val上的__ob__（指向这个val的dep实例）属性。
            childOb.dep.depend() //将对应val的dep实例添加到Dep.target中
            if (Array.isArray(value)) {
                dependArray(value)
            }
        }
    }
    
    dep.depend()时
    Dep.target.addDep(this)  //this,当前dep实例
    
    addDep (dep: Dep) {
        const id = dep.id
        if (!this.newDepIds.has(id)) { //确保当前dep的唯一性，watchder中的newDeps中添加dep
            this.newDepIds.add(id) 
            this.newDeps.push(dep) 
            if (!this.depIds.has(id)) {//确保每个dep中watcher的唯一性
                dep.addSub(this)//向dep中添加watcher
            }
        }
    }
    
    
 7：得到的结果 ，watcher和dep相互引用   ，watcher中的newDeps有dep
    watcher实例中，存放当前watcher对应的dep（唯一性，不存在重复的dep）
         newDepIds：存放depId的集合（唯一性）
         newDeps：存放deps的集合（唯一性）
    dep实例中
        this.subs.push(sub)  this.subs存放当前dep对应的watcher（唯一性，不存在重复的watcher）
        
        
             
             
## 更新,当对应的数据发送改变时，触发拦截器set，调用dep.notify()方法通知更新

1：给数据进行重新赋值时通过代理映射到option._data中，从而触发对应的set拦截器

```
set:function(newVal){
   dep.notify() 
}
```
2:调用dep.notify(),循环这个属性对应的watcher，执行update

```
//Dep实例中
notify () {
    //创建一个新的watcher数组，改属性的所有watcher
    const subs = this.subs.slice()
    //循环这个dep对应的watcher,每个watcher实例执行update方法
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
}
```
3:执行queueWatcher，将watcher推入观察者队列中，
```
//watcher实例中，调用queueWatcher推入到观察者队列中
update () {
    queueWatcher(this)
}

const queue: Array<Watcher> = []  //观察者集合
const activatedChildren: Array<Component> = []
let has: { [key: number]: ?true } = {} //存放已加入队列的watcher的id
let circular: { [key: number]: number } = {}
let waiting = false  //当前队列是否等待中
let flushing = false //当前队列是否已经刷新
let index = 0
//将watcher推入到观察者中
queueWatcher (watcher: Watcher){
    const id = watcher.id
    if (has[id] == null) { //记录当前watcher的id。，确保对应watcher不重复。
        has[id] = true
        if (!flushing) {//flushing  代表当前队列是否刷新
            queue.push(watcher)
        } else {
            // if already flushing, splice the watcher based on its id
            // if already past its id, it will be run next immediately.
            let i = queue.length - 1
            while (i > index && queue[i].id > watcher.id) {
                i--
            }
            queue.splice(i + 1, 0, watcher)
        }
        // queue the flush  队列刷新
        if (!waiting) {  //当前队列的状态是否等待中。
            waiting = true
            nextTick(flushSchedulerQueue)
        }
    }
}



```

  
  



