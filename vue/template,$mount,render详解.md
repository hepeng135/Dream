#### 首先我们先了解这两种初始化的方法

```
    new Vue({
        el:'#app',
        template:'<p></p>',
    })

    import appComponent from ....
    new Vue({
        render:h=>h(appComponent)
    }).$mount('#app');

```
#### 这两种初始化方式有什么不同呢，我们从源码的角度去分析一下。 