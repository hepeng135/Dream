

const vnodeType={
    HTML:'HTML',
    TEXT:'TEXT',


    COMPONENT:'COMPONENT',
    CLASS_COMPONENT:'CLASS_COMPONENT'

}

const childType={
    ENPTY:'EMPTY',
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
    mount(vnode,container)
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
    let dom=document.createTextNode(vnode.children)
}

//新建文本类型的vnode
function createTextVnode(text){
    return {
        flag: vnodeType.TEXT,
        tag:null,
        data:null,
        children: text,
        childrenFlag: childType.ENPTY,
        el:null
    }
}