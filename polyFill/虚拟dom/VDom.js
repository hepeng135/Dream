

const vnodeType={
    HTML:'HTML',
    TEXT:'TEXT',
    COMPONENT:'COMPONENT',
    CLASS_COMPONENT:'CLASS_COMPONENT'

};

const childType={
    EMPTY:'EMPTY',
    SINGLE:'SINGLE',
    MULTIPLE:'MULTIPLE',
}

//新建虚拟dom
//名字，属性，子节点
function createElement(tag,data,children=null) {
    let flag;
    if(typeof tag==='string'){
        flag=vnodeType.HTML
    }else if(typeof tag ==='function'){
        flag=vnodeType.COMPONENT
    }else{
        flag=vnodeType.TEXT
    }
    let childrenFlag;
    if(children==null){
        childrenFlag=childType.EMPTY;
    }else if(Array.isArray(children)){
        let length=children.length;
        if(length==0){
            childrenFlag=childType.EMPTY;
        }else{
            childrenFlag=childType.MULTIPLE
        }
    }else{
        //其他情况任务是文本；
        childrenFlag=childType.SINGLE;
        children=createTextVnode(children+'');
    }

    return {
        flag,  //vnode类型
        tag:tag,//标签名， div  文本没有tag   组件就为一个函数
        data,
        children,
        childrenFlag,
        el:null
    }
}

//渲染,  要渲染的虚拟dom  和容器
function render(vnode,container){
    //区分首次渲染和再次渲染
    if(container.vnode){
        //更新对比渲染
        patch(container.vnode,vnode,container);
    }else{
        //首次渲染
        mount(vnode,container)
    }
    container.vnode=vnode
}
function patch(prev,next,container){

    let nextFlag=next.flag;
    let prevFlag=prev.flag;


    if(nextFlag!==prevFlag){ //当元素类型不一样时
        replaceVnode(prev,next,container);
    }else if(nextFlag=== vnodeType.HTML){//当元素类型都是html时
        patchElement(prev,next,container);
    }else if(nextFlag=== vnodeType.TEXT){//当元素类型都是text时
        patchText(prev,next,container)
    }

}

function patchElement(prev,next,container) {
    //当前标签名和之前的标签名不同时
    if(prev.tag!==next.tag){
        replaceVnode(prev,next,container)
        return
    }
    //更新标签上的属性 data
    let el=(next.el=prev.el);
    let prevData=prev.data;
    let nextData=next.data;
    if(nextData){//遍历新的，进行更新、添加
        for(let key in nextData){
            let prevVal=prevData[key];
            let nextVal=nextData[key];
            patchData(el,key,prevVal,nextVal)
        }
    }
    //遍历老的，进行删除
    if(prevData){
        for(let key in prevData){
            let prevVal=prevData[key];
            (prevVal && !nextData.hasOwnProperty(key)) && patchData(el,key,prevVal,null)
        }
    }

    //patchChildren, 更新子元素
    patchChildren(
        prev.childrenFlag,
        next.childrenFlag,
        prev.children,
        next.children,
        el
    )
}
//更新子元素
function patchChildren(prevChildFlag,nextChildFlag,prevChild,nextChild,container) {

    //1：老的是单独的，老的是空单独，老的是多个

    //2：新的是多个，新的是空的，新的是多个

    switch(prevChildFlag){
        case childType.SINGLE :  //老的单个
            switch (nextChildFlag) {
                case childType.SINGLE :  //新的是单个
                    patch(prevChild,nextChild,container);
                    break

                case childType.EMPTY : //新的是空的
                    container.removeChild(prevChild.el)
                    break

                case childType.MULTIPLE: //新的是多个
                    container.removeChild(prevChild.el);
                    for (let i=0;i<nextChild.length;i++){
                        mount(nextChild[i],container)
                    }
                    break
            }
            break

        case childType.EMPTY : //老的是空的
            switch (nextChildFlag) {
                case childType.SINGLE :  //新的是单个
                    mount(nextChild,container)
                    break

                case childType.EMPTY : //新的是空的

                    break

                case childType.MULTIPLE: //新的是多个
                    for (let i=0;i<nextChild.length;i++){
                        mount(nextChild[i],container)
                    }
                    break
            }
            break

        case childType.MULTIPLE : //老的是多个
            switch (nextChildFlag) {
                case childType.SINGLE :  //新的是单个
                    for (let i=0;i<prevChild.length;i++){
                        container.removeChild(prevChild[i]);
                    }
                    mount(nextChild,container)
                    break

                case childType.EMPTY : //新的是空的
                    for (let i=0;i<prevChild.length;i++){
                        container.removeChild(prevChild[i]);
                    }
                    break

                case childType.MULTIPLE: //新的是多个
                    //老的有多个，新的也有多个，这种情况最复杂，
                    //众多的虚拟dom框架算法在这里的优化策略都不一样
                    console.log(11111111)
                    break
            }
            break
    }

}
//更新文本节点
function patchText(prev,next) {
    let el=(next.el=prev.el);
    if(prev.children!==next.children){
        el.nodeValue=next.children;
    }
}
//当前元素不一样，一直remove掉原来的，更新最新的
function replaceVnode(pev,next,container) {
    container.removeChild(prev.el);
    mount(next,container)
}
//首次渲染,挂载元素
function mount(vnode,container){
    let {flag}=vnode;
    if(flag===vnodeType.HTML){
        mountElement(vnode,container)
    }else if(flag===vnodeType.TEXT){
        mountText(vnode,container)
    }
}
function  mountElement(vnode,container){
    let dom=document.createElement(vnode.tag);
   //  let data=vnode.data;//属性
    vnode.el=dom;
    let {data,children,childrenFlag}=vnode;
    //挂载data
    if(data){
        for (let key in data){
            //节点，ket，老值，新值
            patchData(dom,key,null,data[key])
        }
    }


    if(childrenFlag !=childrenFlag.EMPTY){
        if(childrenFlag===childType.SINGLE){
            mount(children,dom)
        }else if(childrenFlag===childType.MULTIPLE){
            for(let i=0;i<children.length;i++){
                mount(children[i],dom);
            }
        }
    }
    container.appendChild(dom);
}

function mountText(vnode,container){
    let dom=document.createTextNode(vnode.children);
    container.appendChild(dom)
}

function patchData(el,key,prev,next){
    switch (key) {
        case "style" :
            for(let k in next){ //添加、更新操作
                el.style[k]=next[k]
            }
            for(let k in prev){
                if(!next.hasOwnProperty(k)){
                    el.style[k]='';
                }
            }
            break
        case "class":
            el.className=next
            break
        default :
            if(key[0]==='@'){
                if(prev){
                    el.removeEventListener(key.slice(1),prev);
                }
                if(next){
                    el.addEventListener(key.slice(1),next);
                }
            }else{
                el.setAttribute(key,next)
            }
    }
}

//新建文本类型的vnode
function createTextVnode(text){
    return {
        flag: vnodeType.TEXT,
        tag:null,
        data:null,
        children: text,
        childrenFlag: childType.EMPTY,
        el:null
    }
}