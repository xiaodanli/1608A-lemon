require(['./js/common.js'], function() {
	require(['mui', 'dom', 'echarts','getUid','picker', 'poppicker', 'dtpicker'], function(mui, dom, echarts,getUid) {
		mui.init();
		function init() {
			//初始化滚动
			initScroll();
			//添加点击事件
			addEvent();
			//初始化date
			initDate();
			//初始化swiper
			initSwiper();
			//初始化图表
			initTable();
			//解决bug
			bug();
			//加载数据
			loadData();
		}
		
		//加载数据
		function loadData(){
			//加载分类数据
			loadClassify();
			
			//获取账单列表
			loadBill();
		}
		
		
			
			
		
		//获取账单列表
		
		function loadBill(selectType,condition){
			var timeType = dom('#select-month').innerHTML === '月' ? 1 : 2,
				time = dom('#select-date').innerHTML;
			
			getUid(function(uid){
				mui.ajax('/api/selectBill',{
					dataType:'json',
					data:{
						uid:uid,
						timeType:timeType,
						time:time,
						selectType:selectType,
						condition:condition
					},
					success:function(res){
						console.log(res);
						if(res.code === 1){
							//渲染账单的函数
							renderBill(res.results);
						}else{
							alert(res.msg);
						}
					},
					error:function(error){
						console.warn(error);
					}
				})
			})
		}
	
		//渲染账单
		function renderBill(data){
			if(status === 'month'){
				//渲染月的
				renderMonthBill(data);
			}else{
				//渲染年的
				renderYearBill(data);
			}
		}
		
		//渲染月的
		function renderMonthBill(data){
			var obj = {};
			var target = [];
			data.forEach(function(item){
				var day = item.create_time.substring(5,10);
				if(!obj[day]){
					obj[day] = {
						list:[],
						totalPay:0,
						title:day
					}
				}
				obj[day].list.push(item);
				
				if(item.c_type === '支出'){
					obj[day].totalPay += item.money*1;
				}
				
			})
			for(var a in obj){
				target.push(obj[a])
			}
			
			console.log(target)
			//以天为循环体
			renderDay(target);
		}
		
		var _payMoney = dom('.pay-money'),				//缓存的花费的总钱数
			_comingMoney = dom('.coming-money');		//缓存的总收入
		
		var allMonthPay = 0,  	//本月总共花的钱
			allMonthCom = 0,	//本月总共收入的钱
			allYearPay = 0,		//本年总共花的钱
			allYearCom = 0;		//本年总共收入的钱
			
		function renderDay(data){
			allMonthPay = 0;
			allMonthCom = 0;
			var str = '';
			data.forEach(function(item,index){
				str += `
					<div class="day-item">
						<div class="day-title">
							<div>
								<span class="mui-icon mui-icon-contact"></span>
								${item.title}
							</div>
							<span class="money gray">${item.totalPay}</span>
						</div>
						<ul class="mui-table-view">`;
				str += renderBillLi(item.list,index);			
				str+=`</ul>
					</div>`;
			})
			
			dom('.month-show').innerHTML = str;
			
			
			_payMoney.innerHTML = "本月花费："+allMonthPay+"元";
			
			_comingMoney.innerHTML = "本月收入"+allMonthCom+"元";
		}
		
		
		function renderBillLi(data,itemIndex){
			return data.map(function(item,index){
				if(status === 'month'){
					if(item.c_type === '支出'){
						allMonthPay += item.money;
					}else{
						allMonthCom += item.money;
					}
				}else{
					if(item.c_type === '支出'){
						allYearPay += item.money;
					}else{
						allYearCom += item.money;
					}
				}
				return `
					<li class="mui-table-view-cell">
						<div class="mui-slider-right mui-disabled">
							<a class="mui-btn mui-btn-red" data-type="${item.c_type}" money="${item.money}" cur-index="${itemIndex}" data-lid="${item.lid}">删除</a>
						</div>
						<div class="mui-slider-handle bill-item">
							<dl>
								<dt>
									<span class="${item.c_icon}"></span>
								</dt>
								<dd>${item.c_name}</dd>
							</dl>
							<span class="${item.c_type === '支出' ?'red':'green'}">${item.money}</span>
						</div>
					</li>
				`;
				
			}).join('');
		}
		
		
		
		//渲染年的
		
		function renderYearBill(data){
// 			{
// 				"10月":{
// 					list:[{},{},{},{}],
// 					title:"10月",
// 					totalPay:,
// 					totalCom:
// 				}
// 			}

			var yObj = {};
			var target = [];
			
			data.forEach(function(item){
				var monthTime = item.create_time.substring(5,7);
				if(!yObj[monthTime]){
					yObj[monthTime] = {
						list:[],
						title:monthTime,
						totalPay:0,
						totalCom:0,
						surplus:0
					}
				}
				
				yObj[monthTime].list.push(item);
				if(item.c_type === '支出'){
					yObj[monthTime].totalPay += item.money*1;
					yObj[monthTime].surplus -= item.money*1;
				}else{
					yObj[monthTime].totalCom += item.money*1;
					yObj[monthTime].surplus += item.money*1;
				}
			})
			console.log(yObj)
			
			for(var i in yObj){
				target.push(yObj[i])
			}
			
			//以月为循环体，渲染
			renderMonth(target);
		}
		//以月为循环体，渲染
		function renderMonth(data){
			allYearPay = 0;		
			allYearCom = 0;	
			var str = '';
			
			data.forEach(function(item,index){
				str += `
					<li class="mui-table-view-cell mui-collapse">
						<a class="mui-navigate-right" href="#">
							<ol class="month-title">
								<li>
									<span class="mui-icon mui-icon-contact"></span>
									${item.title}月
								</li>
								<li class="red">
									<span>花费</span>
									<span class="year-pay">${item.totalPay}</span>
								</li>
								<li class="green">
									<span>收入</span>
									<span class="year-incom">${item.totalCom}</span>
								</li>
								<li class="gray">
									<span>结余</span>
									<span class="yar-surplus">${item.surplus}</span>
								</li>
							</ol>
						</a>
						<div class="mui-collapse-content">
							<ul class="mui-table-view">`;
					str += 	renderBillLi(item.list,index);		
					str +=	`</ul></div></li>`;
				dom('.year-show').querySelector('.mui-table-view').innerHTML = str;
				
				_payMoney.innerHTML = "本月花费："+allYearPay+"元";
				
				_comingMoney.innerHTML = "本月收入"+allYearCom+"元";
				
			})
		}
		
		
		//加载分类数据
		
		function loadClassify(){
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
		
		function render(data){
					//第一件事：分组  支出和收入
					
		// 			{
		// 				"支出":[{}],{},{}],
		// 				"收入":[]
		// 			}
		
					
			var targetObj = {};		
			data.forEach(function(item){
				if(!targetObj[item.c_type]){
					targetObj[item.c_type] = [];
				}
				targetObj[item.c_type].push(item);
			})
			console.log(targetObj);
			
			dom('.pay').innerHTML = renderLi(targetObj['支出']);
			
			dom('.income').innerHTML = renderLi(targetObj['收入']);
			
		}
		
		//渲染分类li
		function renderLi(data){
			return data.map(function(item){
				return `<li data-cid="${item.cid}">${item.c_name}</li>`
			}).join('')
		}
		
		
		
		function bug(){
			var offCanvasInner = document.querySelector('.mui-inner-wrap');
			offCanvasInner.addEventListener('drag', function(event) {
				event.stopPropagation();
			});
		}
		
		function initTable(){
			 var myChart = echarts.init(dom('#income'));
			 option = {
				 graphic:{
					type:'text',
					left:'center',
					top:'center',
					style:{
						text:'收入', //使用“+”可以使每行文字居中
						textAlign:'center',
						font:'italic bolder 16px cursive',
						fill:'#000',
						width:30,
						height:30
					}
				},
				series: [
					{
						name:'访问来源',
						type:'pie',
						radius: ['40%', '55%'],
						data:[
							{value:335, name:'直达'},
							{value:310, name:'邮件营销'},
							{value:234, name:'联盟广告'},
							{value:135, name:'视频广告'},
							{value:1048, name:'百度'},
							{value:251, name:'谷歌'},
							{value:147, name:'必应'},
							{value:102, name:'其他'}
						]
					}
				]
			};
			 myChart.setOption(option);
		}
		
		//初始化swiper
		function initSwiper(){
			mui('#table-swiper').slider();
		}
		 

		//初始化时间
		var pinker = null,
			dtPicker = null,
			curYear = new Date().getFullYear(), //年
			curMonth = new Date().getMonth() + 1, //月
			_selectDate = dom('#select-date'),
			status = 'month';

		//初始化时间
		function initDate() {
			picker = new mui.PopPicker();
			picker.setData([{
				value: 'month',
				text: '月'
			}, {
				value: 'year',
				text: '年'
			}]);

			_selectDate.innerHTML = curYear + '-' + curMonth;
			dtPicker = new mui.DtPicker({
				type: 'month'
			});
		}

		//初始化滚动
		function initScroll() {
			// 侧边滚动
			mui('.aside-scroll').scroll({
				deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			});
			//主页面滚动
			mui('.con-scroll').scroll({
				deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			});
		}

		//添加点击事件
		function addEvent() {
			// 打开侧边栏
			dom('.close-aside').addEventListener('tap', function() {
				mui('.mui-off-canvas-wrap').offCanvas('close');
			})

			// 关闭侧边栏
			dom('#open-aside').addEventListener('tap', function() {
				mui('.mui-off-canvas-wrap').offCanvas('show');
			})

			//点击月或年
			dom('#select-month').addEventListener('tap', function() {
				var that = this;
				picker.show(function(selectItems) {
					that.innerHTML = selectItems[0].text;
					status = selectItems[0].value;
					
					var _monthShow = dom('.month-show'),
						_yearShow = dom('.year-show'),
						config = {
							status:'inline-block',
							width:'50%'
						};
					if (status === 'month') {
						_selectDate.innerHTML = curYear + "-" + curMonth;
					} else {
						_selectDate.innerHTML = curYear;
						config = {
							status:'none',
							width:'100%'
						};
					}
					
					dom('h5[data-id="title-m"]').style.display = config.status;
					dom('h5[data-id="title-y"]').style.width = config.width;
					dom('.mui-picker[data-id="picker-m"]').style.display =  config.status;
					dom('.mui-picker[data-id="picker-y"]').style.width = config.width;
					
					_monthShow.style.display = status === 'month'? 'block':'none';
					_yearShow.style.display = status === 'month'? 'none':'block';;
					//获取账单列表
					loadBill();
				})
			})

			//点击选择时间
			_selectDate.addEventListener('tap', function() {
				var that = this;
				dtPicker.show(function(selectItems) {
					curYear = selectItems.y.text;
					curMonth = selectItems.m.text;
					if(status === 'month'){
						that.innerHTML = selectItems.value;
					}else{
						that.innerHTML = curYear;
					}
					//获取账单列表
					loadBill();
				})
			})
			
			//点击tab
			mui('.tab-list').on('tap','span',function(){
				var spanList = Array.from(dom('.tab-list').querySelectorAll('span'));
				
				for(var i=0;i<spanList.length;i++){
					spanList[i].classList.remove('active');
				}
				this.classList.add('active');
				
				var id = this.getAttribute('data-id'); //string
				
				dom('.bill-wrap').style.display = id == 0 ? 'block' : 'none';
				dom('.table-wrap').style.display = id == 0 ? 'none' : 'block'; 
			})
			
			//去添加账单界面
			dom('.go-bill').addEventListener('tap',function(){
				location.href="../../page/add-bill.html";
			})
			
			//点击收入和支出
			mui('.type').on('tap','li',function(){
				var id = this.getAttribute('data-id');
				
				var classifyUls = document.querySelectorAll('.classify');
				
				var lis = Array.from(classifyUls[id].querySelectorAll('li'));
				
				if(this.className.indexOf('active') != -1){
					this.classList.remove('active');
					for(var i = 0;i<lis.length;i++){
						lis[i].classList.remove('yellow');
					}
				}else{
					this.classList.add('active');
					for(var i = 0;i<lis.length;i++){
						lis[i].classList.add('yellow');
					}
				}

				//按收支分类查询
 				conditionBill();
				
			})
		
			//点击分类
			mui('.classify').on('tap','li',function(){
				var id = this.parentNode.getAttribute('data-id');
				
				var targetLi = dom('.type').querySelectorAll('li')[id];
				
				if(this.className.indexOf('yellow') != -1){
					this.classList.remove('yellow');
					targetLi.classList.remove('active');
					
				}else{
					this.classList.add('yellow');
					
					var activeLen = this.parentNode.querySelectorAll('.yellow').length;
					
					var lisLen = this.parentNode.children.length;
					
					if(activeLen === lisLen){
						targetLi.classList.add('active');
					}
				}
				//按收支分类查询
				conditionBill();
				
			})
			
			//按收支分类查询
			function conditionBill(){
				var yellowLis = Array.from(dom('.aside-scroll').querySelectorAll('.yellow'));
				
				var conditionArr = [];
				
				for(var i=0;i<yellowLis.length;i++){
					conditionArr.push(yellowLis[i].innerHTML);
				}
				if(conditionArr.length){
					loadBill(2,conditionArr);
				}else{
					loadBill();
				}
			}
			
			var _monthShow = dom('.month-show'),
				_yearShow = dom('.year-show');
			
			//点击删除按钮
			mui('.bill-wrap').on('tap','.mui-btn',function(event){
				
				var elem = this;
				var li = elem.parentNode.parentNode;

				mui.confirm('确认删除该账单？', '提示', ['确认', '取消'], function(e) {
					if(e.index == 0){
						var id = elem.getAttribute('data-lid'),
							money = elem.getAttribute('money'),
							itemIndex = elem.getAttribute('cur-index'),
							type = elem.getAttribute('data-type');
							
						
						mui.ajax('/api/delBill',{
							dataType:'json',
							data:{
								lid:id
							},
							success:function(res){
								
// 								var allMonthPay = 0,  	//本月总共花的钱
// 									allMonthCom = 0,	//本月总共收入的钱
// 									allYearPay = 0,		//本年总共花的钱
// 									allYearCom = 0;		//本年总共收入的钱
								if(status === 'month'){
									var targetItem = li.parentNode.parentNode;
									if(type === '支出'){
										allMonthPay -= money*1;
										_payMoney.innerHTML = "本月花费"+allMonthPay+"元";
										targetItem.querySelector('.money').innerHTML -= money*1;
									}else{
										allMonthCom -= money*1;
										_comingMoney.innerHTML = "本月收入"+allMonthCom+"元";
									}
								}else{
									var targetItem = li.parentNode.parentNode.parentNode;
									if(type === "支出"){
										
										
										allYearPay -= money*1;
										_payMoney.innerHTML = "本月花费:"+allYearPay+"元";
										
										targetItem.querySelector('.year-pay').innerHTML -= money*1;
										
									}else{
										allYearCom -= money*1;
										_comingMoney.innerHTML = "本月收入:"+allYearCom+"元";
										
										targetItem.querySelector('.year-incom').innerHTML -= money*1;
									}
									
									targetItem.querySelector('.yar-surplus').innerHTML = targetItem.querySelector('.year-incom').innerHTML - targetItem.querySelector('.year-pay').innerHTML;
								}
								
								if(res.code === 1){
									if(li.parentNode.children.length > 1){
										li.parentNode.removeChild(li);
									}else{
										if(status === 'month'){
											_monthShow.removeChild(li.parentNode.parentNode);
										}else{
											_yearShow.querySelector('.mui-table-view').removeChild(li.parentNode.parentNode.parentNode);
										}
									}
								}else{
									alert(res.msg);
								}
							}
						})
					}else{
						setTimeout(function() {
							mui.swipeoutClose(li);
						}, 0);
					}
				});
			})
		}

		init(); //页面主入口
	})
})
