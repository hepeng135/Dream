## 什么是虚拟DOM

由于浏览器标准的html过于复杂，我们自己用简单的js对象去描述html中的DOM节点，这个就是虚拟DOM。


## 虚拟DOM如何新建

其实在react和vue中，虚拟DOM的创建都是由模板或JSX来完成的，从模板到compile到render函数的转译或者JSX到compile到render函数
的转译都是由工程化工具负责，既webpack+loader。 