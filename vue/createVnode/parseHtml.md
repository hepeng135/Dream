



####处理开始标签
    正则表达式
    startTagOpen=/^<((?:[a-zA-Z_][\-\.0-9_a-zA-Z]\:)?[a-zA-Z_][\-\.0-9_a-zA-Z]*)/
    
    通过正则获取标签
    html.match(startTagOpen)[1];
    
    
    




