define(function(){
	//格式化数据
	function format(data,num){
		var target = [];
		var group = Math.ceil(data.length/num);
		
		for(var i = 0; i< group;i ++){
			target.push(data.splice(0,num));
		}
		return target
	}
	return format
})