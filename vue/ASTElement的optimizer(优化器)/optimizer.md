optimize:优化ASTElement,给标签加static和staticRoot

```
function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

const genStaticKeysCached = cached(genStaticKeys)


export function optimize (root: ?ASTElement, options: CompilerOptions) {
    if (!root) return

    //options.staticKeys:"staticClass,staticStyle"
    isStaticKey = genStaticKeysCached(options.staticKeys || '')
    
    //isPlatformReservedTag:判断当前传进的字符串是否html标签
    isPlatformReservedTag = options.isReservedTag || no
    // first pass: mark all non-static nodes.
    //标记所有静态节点 el.static：true  or false   静态节点，非静态节点
    markStatic(root)
    
    //标签所有的静态父节点
    markStaticRoots(root, false)
}
//添加static
function markStatic (node: ASTNode) {

    //isStatic 判断传进去的node是否静态节点
    node.static = isStatic(node)
    
    if (node.type === 1) {
    
        //isPlatformReservedTag函数，确定是否html标签，当不是web平台标签时，就表示是自定义标签既自定义指令
        //当前标签是自定义组件且不是slot  且没有inline-template属性
        if (
            !isPlatformReservedTag(node.tag) &&
            node.tag !== 'slot' &&
            node.attrsMap['inline-template'] == null
        ) {
            return
        }
        //循环node.children,进行递推判断
        for (let i = 0, l = node.children.length; i < l; i++) {
            const child = node.children[i]
            markStatic(child)
            if (!child.static) { //子集为非静态时，父级就为非静态
                node.static = false
            }
        }
        //如果带有v-if  则循环ifConditions中的所有标签
        if (node.ifConditions) {
            for (let i = 1, l = node.ifConditions.length; i < l; i++) {
                const block = node.ifConditions[i].block
                markStatic(block)
                if (!block.static) {
                    node.static = false
                }
            }
        }
    }
}
//添加staticRoot
function markStaticRoots (node: ASTNode, isInFor: boolean) {
    if (node.type === 1) {
        //当前是静态标签或者拥有v-once指令，
        if (node.static || node.once) {
            node.staticInFor = isInFor //当前是否拥有v-for
        }
        //当静态节点下只有一个子节点且为文本节点时，我们不标记,因为没有收益
        if (node.static && node.children.length && !(
            node.children.length === 1 &&
            node.children[0].type === 3
        )) {
            node.staticRoot = true
            return
        } else {
            node.staticRoot = false
        }
        if (node.children) {
            for (let i = 0, l = node.children.length; i < l; i++) {
                markStaticRoots(node.children[i], isInFor || !!node.for)
            }
        }
        if (node.ifConditions) {
            for (let i = 1, l = node.ifConditions.length; i < l; i++) {
                markStaticRoots(node.ifConditions[i].block, isInFor)
            }
        }
    }
}

```