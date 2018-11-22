require(['../js/common.js'],function(){
	require(['mui','dom','getUid','format','picker', 'poppicker', 'dtpicker'],function(mui,dom,getUid,format){
		
		mui.init();
		
		function init(){
			//初始化时间
			initDate();
			
			//添加点击事件
			addEvent();
			
			//获取数据
			loadData();
		}
		
		//获取数据
		function loadData(){
			//获取分类的数据
			getClassify();
		}
		
		//获取分类的数据
		function getClassify(){
			getUid(function(uid){
				mui.ajax('/api/getClassify',{
					dataType:'json',
					data:{
						uid:uid
					},
					success:function(res){
						console.log(res);
						if(res.code === 1){
							//渲染分类数据
							render(res.results);
						}
					}
				})
			})
		}
		
		var type = '支出';
		
		var targetObj = {};
		
		function render(data){
			//第一件事：分组  支出和收入
			
// 			{
// 				"支出":[{}],{},{}],
// 				"收入":[]
// 			}

			
			
			data.forEach(function(item){
				if(!targetObj[item.c_type]){
					targetObj[item.c_type] = [];
				}
				targetObj[item.c_type].push(item);
			})
			console.log(targetObj);
			// 渲染分类
			renderClassify(targetObj);
		}
		
		function renderClassify(data){
			var finalData = format(data[type].slice(0),8);
			
			var str = '';
			
			finalData.forEach(function(item){
				str+= '<div class="mui-slider-item"><div>'+renderDl(item)+'</div></div>';
			})
			
			dom('.mui-slider-group').innerHTML = str;
			
			var items = dom('.mui-slider-group').querySelectorAll('.mui-slider-item'),
				lastItem = items[finalData.length-1];
				
			var custom = `
				<dl class="go-classify">
					<dt>
						<span class="mui-icon mui-icon-plus"></span>
					</dt>
					<dd>自定义</dd>
				</dl>
			`;	
				
			if(lastItem.querySelectorAll('dl').length % 8 === 0){
				str += '<div class="mui-slider-item"><div>'+custom+'</div></div>';
				dom('.mui-slider-group').innerHTML = str;
			}else{
				lastItem.querySelector('div').innerHTML +=  custom;
			}
			
			items[0].querySelectorAll('dl')[0].classList.add('active');
			
			var slider = mui('.mui-slider').slider();
			slider.gotoItem(0,0); //第一个参数：第几个item  第二个参数：时间
		}
		
		//渲染分类dl
		function renderDl(data){
			return data.map(function(v){
				return `
					<dl data-cid="${v.cid}">
						<dt>
							<span class="${v.c_icon}"></span>
						</dt>
						<dd>${v.c_name}</dd>
					</dl>
				`
			}).join('')
		}
		
		
		//初始化时间
		
		var dtPicker = null,
			curYear = new Date().getFullYear(),
			curMonth = new Date().getMonth() + 1,
			curDay = new Date().getDate(),
			_time = dom('.time');
				
		//初始时间
		function initDate(){
			
			_time.innerHTML = curYear + '-' + curMonth + '-' + curDay;
			dtPicker =  new mui.DtPicker({
				type:'date'
			}); 
		}
		
		//添加账单
		
		function addBill(){
// 			 var uid = params.uid,
// 			   cid = params.cid,
// 			   create_time = params.create_time,
// 			   money = params.money;
			getUid(function(uid){
				var cid = dom('.tyle-list').querySelector('.active').getAttribute('data-cid'),
					create_time = dom('.time').innerHTML,
					money = dom('.input-money').innerHTML;
				mui.ajax('/api/addBill',{
					dataType:'json',
					type:'post',
					data:{
						uid:uid,
						cid:cid,
						create_time:create_time,
						money:money
					},
					success:function(res){
						console.log(res);
						if(res.code === 1){
							alert(res.msg);
							dom('.input-money').innerHTML = 0.00;
							location.href="../../index.html"
						}
					}
				})
			})
		}
		
		//添加事件
		
		function addEvent(){
			
			//选择时间
			dom('.time').addEventListener('tap',function(){
				dtPicker.show(function(selectItems){
					_time.innerHTML = selectItems.text;
				})
			})
			
			//点击键盘
			mui('.keyboard').on('tap','span',function(){
				var _inputMoney = dom('.input-money');
				var val = this.innerHTML;
				var iptVal = _inputMoney.innerHTML;
				if(val === 'x'){
					_inputMoney.innerHTML = iptVal.slice(0,iptVal.length-1);
					return
				}else if(val === '完成'){
					//添加账单
					addBill();
					return
				}
				
				if(iptVal === '0.00'){
					_inputMoney.innerHTML = val;
				}else if(iptVal.indexOf('.') != -1 && val === '.'){
					_inputMoney.innerHTML = iptVal;
				}else if(iptVal.indexOf('.') != -1 && iptVal.split('.')[1].length == 2){
					_inputMoney.innerHTML = iptVal;
				}else{
					_inputMoney.innerHTML = iptVal + val;
				}
			})
			
			//点击分类
			mui('.tyle-list').on('tap','dl',function(){
				var dlList = Array.from(dom('.tyle-list').querySelectorAll('dl'));
				
				for(var i = 0;i < dlList.length; i++){
					dlList[i].classList.remove('active');
				}
				
				this.classList.add('active');
			})
			
			//点击tab
			mui('.tab-list').on('tap','span',function(){
				var spanList = Array.from(dom('.tab-list').querySelectorAll('span'));
				
				for(var i=0;i<spanList.length;i++){
					spanList[i].classList.remove('active');
				}
				this.classList.add('active');
				type = this.innerHTML;
				renderClassify(targetObj);
			})
			
			//去新建收支分类页
			mui('.mui-slider-group').on('tap','.go-classify',function(){
				location.href="../../page/classify.html?status="+type;
			})
		}
		
		init(); //页面的主入口文件
		
	})
})