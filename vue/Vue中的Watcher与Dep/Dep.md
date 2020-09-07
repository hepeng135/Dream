首先先看Dep这个类的源码

```
export default class Dep {
    //构造函数,初始化id与sub。
    //id通过全局uid进行递增，每个dep实例都拥有一个独立的id
    //sub：出书画为一个数组，里面放这个dep实例对应的watcher实例。
    constructor () {
        this.id = uid++
        this.subs = []
    }
    //原型方法，添加watcher实例到subs中
    addSub (sub: Watcher) {
        this.subs.push(sub)
    }
    //原型方法，将给定的watcher实例从sub集合中删除
    removeSub (sub: Watcher) {
        remove(this.subs, sub)
    }
    //原型方法，给当前watchers实例添加dep，该方法实现watcher中引用dep
    //Dep.target:指向watcher实例
    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)//向watcher中添加对应的dep
        }
    }
    //原型方法，通知该dep依赖的watcher进行更新操作
    notify () {
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {//循环这个dep对应的watcher
            subs[i].update()
        }
    }
}
Dep的构造函数属性（静态属性）
Dep.target = null
const targetStack = []

//pushTarget 和  popTarget方法用于维护targetStack这个数组栈，添加or删除，同时更新Dep.target操作

//给Dep的构造函数属性target赋值，并添加到targetStack中
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
//删除操作
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```
