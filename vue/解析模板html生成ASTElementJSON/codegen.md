

```$xslt

'with(this){
    return 

}'

```


genDirectives


```
'directives:[]'

```



```$xslt


"with(this){
    return _c('div',
        {staticClass:"app"},
        [_c('div',
            {
                directives:[
                    {name:"demo",rawName:"v-demo:{type,job}.job",value:(title),expression:"title",arg:"{type,job}",modifiers:{"job":true}}
                ],
                attrs:{"innerhtml":title},
                on:{"click":eventClick}
            }
        )]
    )
}"
```
