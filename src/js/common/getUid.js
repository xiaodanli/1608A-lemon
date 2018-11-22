define(function(){
	var getUid = function(fn){
		var uid = window.localStorage.getItem('uid') || '';
		
		if(!uid){
			mui.ajax('/users',{
				dataType:'json',
				type:'post',
				success:function(res){
					console.log(res);
					if(res.code === 1){
						window.localStorage.setItem('uid',res.uid);
						//添加分类
						fn(res.uid)
					}
				}
				
			})
		}else{
			fn(uid)
		}
	}
	
	return getUid
})