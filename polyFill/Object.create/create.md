# Object.create(prototype,propertyObject) #
创建一个新的对象，当前对象的原型为prototype，当前对象的属性为propertyObject。 

+ <b>prototype：</b>一个对象，作为新对象的原型
+ <b>propertyObject：</b>一个对象，作为新对象的属性,与defineProperties的第二个参数一样。默认的writable,configurable为false。

>### 访问属性与访问原型的区别 ###
```
let arg1={
    name:'hepeng1',
    age:22,
    sayName(){
        console.log(this.name)
    }
}
let arg2={
    name:{
        value:"hepeng2",
        writable:true
    },
    sayName:{
        value(){
            console.log(this.name);
        },
        writable:true
    }
}
let obj=Object.create(arg1,arg2)
console.log(obj.name) =>'hepeng2'  访问实例属性
console.log(obj.age) =>'22';        访问实例原型
obj.sayName()  =>hepeng2        访问实例属性

```

>### 在继承中的运用

```
//单继承
function Sup(){
    this.name='hepeng';
    this.age='22';
}
Sup.prototype.sayName=function(){
    console.log(this.name);
}

function Sub(){
    Sup.call(this);
}
Sub.prototype=Object.create(Sup.prototype);
Sub.prototype.constructor=Sub;
Sub.prototype.sayAge=function(){
    console.log(this.age)
}

//继承多个
function myClass(){
    Sup.call(this);
    otherSupClass.call(this);
}

```
>### Object.create的Polyfill

```
//不支持当前第一个参数为null和不支持第二个参数
(function(){
    Object.create=function(prototype){
        var fn=function(){}
        fn.prototype=prototype;
        return new fn()
    }
})()

```



