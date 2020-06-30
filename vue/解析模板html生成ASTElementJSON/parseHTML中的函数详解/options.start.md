#### options.start:主要用来处理特殊标签（input）、当前属性名是一些自定义指令或者Vue自带指令(v-for、v-if、v-else-if、v-els、v-pre、v-once)


#### 函数背景
    定义在



####start函数的作用
    1：创建一个完整的数据标签json
    2：处理当前解析成数据json格式标签的attr属性，
    3：当前标签是否root根元素，既该组件所属html模板的最外层元素（非template）。

####参数
    @params tag:标签名
    @params attrs:标签属性集合
    @params unary:当前是否单个可闭合标签
    @params start:正则符合开始的地方
    @params end:正则符合结束的地方
#### 函数执行内容
   
   
   
   
```
start (tag, attrs, unary, start, end) {
                  //当前标签放入父级并且父级的ns属性  或者 当前标签是否svg
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)
            
       //处理svg在Ie中的属性
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs)
      }
       //创建一个完整的标签数据json ，
      let element: ASTElement = createASTElement(tag, attrs, currentParent)
      if (ns) {
        element.ns = ns
      }
       //element上添加start，end，rawAttrsMap属性
      if (process.env.NODE_ENV !== 'production') {
        if (options.outputSourceRange) {
          element.start = start
          element.end = end
          element.rawAttrsMap = element.attrsList.reduce((cumulated, attr) => {
            cumulated[attr.name] = attr
            return cumulated
          }, {})
        }
      }
        //判断当前标签是否style、script 并且不再服务端
      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true
      }

      //处理input。当不是input类标签时preTransforms函数返回undefined
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element
      }
       //默认当前标签及其子级需要进行编译处理
      if (!inVPre) {
        processPre(element)//检测当前标签是否拥有v-pre指令
        if (element.pre) {
          inVPre = true
        }
      }
        //返回当前标签是否pre
      if (platformIsPreTag(element.tag)) {
        inPre = true
      }
      if (inVPre) {
        processRawAttrs(element)//处理pre标签
      } else if (!element.processed) {//当前是v-if等指令时
        // structural directives
        processFor(element)
        processIf(element)
        processOnce(element)
      }

      if (!root) {//如果当前没有根标签，则lement为根标签
        root = element
        if (process.env.NODE_ENV !== 'production') {
          checkRootConstraints(root)//当前父级不能是solt element ,必须有一个标签作为父级
        }
      }
        //如果当前不是单个可闭合标签  
      if (!unary) {//确定当前父级
        currentParent = element
        stack.push(element)
      } else {
        closeElement(element)
      }
    },

```