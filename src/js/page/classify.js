require(['../js/common.js'],function(){
	require(['mui','dom','getParams','getUid','format'],function(mui,dom,getParams,getUid,format){
		mui.init();
		//初始化页面
        function init(){
			//加载页面初始化
			loadInit();
			//添加点击事件
			addEvent();
			
		}
		
		//加载数据
		function loadInit(){
			mui.ajax('/api/getCIcon',{
				dataType:'json',
				success:function(res){
					console.log(res);
					if(res.code === 1){
						renderIcon(res.results);
					}
				}
				
			})
		}
		
		// [[{},{}],[]]
		//渲染分类数据
		function renderIcon(data){
			
			var target = format(data,15);
			
			var str = '';
			
			target.forEach(function(item){
				str += '<div class="mui-slider-item"><ul>'+renderItem(item)+'</ul></div>'
			})
			
			dom('.mui-slider-group').innerHTML = str;
			mui('.mui-slider').slider();
		}
		
		function renderItem(arr){
			return arr.map(function(item){
				return  `
					<li>
						<span class="${item.icon_name}"></span>
					</li>
				`
			}).join('');
		}
		
		
		
		
		function addEvent(){
			//点击图标
			mui('.mui-slider-group').on('tap','span',function(){
				var c_name = this.className;
				dom('#c-icon').className = c_name;
			})
			
			//点击保存
			
			dom('.save-btn').addEventListener('tap',function(){
				getUid(function(uid){
					//添加分类
					addClassify(uid);
				})
			})
			//添加分类
			function addClassify(uid){
				var cName = dom('.c-name').value,
					cIcon = dom('#c-icon').className,
					cType = decodeURI(getParams.status);
					
				if(!cName){
					alert("没有输入分类名")
				}else{
					mui.ajax('/api/addClassify',{
						dataType:'json',
						type:'post',
						data:{
							cName:cName,
							cIcon:cIcon,
							cType:cType,
							uid:uid
						},
						success:function(res){
							if(res.code === 1){
								location.href="../../page/add-bill.html";
							}else{
								alert(res.msg);
							}
						},
						error:function(error){
							console.wran(error);
						}
					})
				}
				
			}
		}
		
		
		
		init();
	})
})