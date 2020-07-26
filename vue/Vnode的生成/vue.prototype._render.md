vue。prototype._render的主要作用
    
        1:确定vm._vnode=_parentVnode;
        2:调用 vnode = render.call(vm._renderProxy, vm.$createElement) 生成vnode


```$xslt

Vue.prototype._render = function (): VNode {
    const vm: Component = this
    //从当前vm.$options中解构出 render 和 _parentNode
    const { render, _parentVnode } = vm.$options
    //当前是否存在_parentVnode
    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }
    
    //设置父节点，一般为子节点的占位符，指向占位符节点上的数据
    vm.$vnode = _parentVnode

    let vnode
    try {
      currentRenderingInstance = vm
      //调用运用生成器将ASTElement生成的函数 
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      
    } finally {
      currentRenderingInstance = null
    }
 
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    
    vnode.parent = _parentVnode
    return vnode
  }


```