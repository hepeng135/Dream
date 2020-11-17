patch:通过对比新旧的虚拟DOM进行更新视图。



### patch在更新DOM时其实在做以下的一些操作
####1.新增节点 (appendChild  或者 insertBefore)
>* 当oldVnode中不存在，但是newVnode中存在时。
>* 当oldVnode和newVnode完全不是一个节点时（删除旧的+创建新的）

####2.删除节点(removeChild)
>* 当oldVnode中存在，但是newVnode中不存在时。(node.remove)
>* 当oldVnode与newVnode完全不一样的时候（删除旧的+创建新的）

####3.移动节点(insertBefore)
>* 当oldNode与newVnode是一个节点，但是位置不同时。(同层DOM结构中)

####4.更新节点
>* 当两个节点是同一个节点时候，我们需要更新节点。（属性更新，文本更新，子节点更新）




#### 更新策略 
diff 新旧首位和末尾四个相互交叉比较，通过while循环，条件为oldStartIndex<=oldEndIndex 且 newStartIndex<=newEndIndex
>A. 当oldStartVnode与newStartVnode进行比较，同一个node时，调用patchVnode,并且oldStartIndex与newStartIndex分别+1,然后更新oldStartVnode、newStartVnode
>>* 当条件符合，新旧节点的位置相同，只需要调用patchVnode进行更新节点。

>B. 当oldEndVnode与newEndVnode进行比较，同一个node时，调用patchVnode,并且oldEndIndex与newEndIndex分别-1,然后更新oldEndVnode、newEndVnode
>>* 当条件符合，新旧节点的位置相同，只需要调用patchVnode进行更新节点。

>C. 当oldStartVnode与newEndVnode进行比较，同一个node时，调用patchVnode,并且oldStartIndex+1,newEndIndex-1,然后更新oldStartVnode、newEndVnode
>>* 当条件符合，新旧节点的位置不同，需要先调用patchVnode进行更新节点，然后移动节点。
>>* 移动的基点，插入oldEndVnode(未处理的)后面，既当前oldEndVnode的下一个兄弟节点之前，调用insertBefore

>D. 当oldEndVnode与newStartVnode进行比较，同一个node时，调用patchVnode,并且oldEndIndex-1,newStartIndex+1,然后更新oldEndVnode与newStartVnode
>>* 当条件符合，新旧节点的位置不同，需要先调用patchVnode进行更新节点，然后移动节点。
>>* 移动的基点，插入oldNewVnode的前面，既当前oldNewVnode的之前，insetBefore。

>其他. 上述条件都不满足时，获取oldVnode集合中未处理节点上的所有key，并组成一个json对象oldKeyToIdx，key为名，index为值，然后跟当前这个newStartVnode的key进行对比
>>* 当在 oldKeyToIdx 中有key与



