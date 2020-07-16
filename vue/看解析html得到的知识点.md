

1:创建一个组件的时候，组件的html模板需要一个root根元素进行包裹，这个root可以挂载v-if指令和后续的v-else指令

    <div class="root" v-if="state==1"></div>
    <div class="root" v-else-if==2></div>
    <div class="root2" v-else></div>
    
    
2:插槽作用域 scope   slot-scope  v-slot 的演变

    (1)第一次 scope 只能挂载到template上使用 
    (2)第二次  slot-scope 可以用于template，也可以用于其他的
    (3)第三次  v-slot 只能挂载在template上
    
    