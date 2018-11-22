require.config({
	baseUrl:'/js/',
	paths:{
		//库文件
		'mui':'./libs/mui.min',
		'picker':'./libs/mui.picker',
		'poppicker':'./libs/mui.poppicker',
		'dtpicker':'./libs/mui.dtpicker',
		'echarts':'./libs/echarts.min',
		
		'dom':'./common/dom',
		'getParams':'./common/getParams',
		'getUid':'./common/getUid',
		'format':'./common/format'
	},
	shim:{
		'poppicker':{
			deps:['mui']
		},
		'picker':{
			deps:['mui']
		},
		'dtpicker':{
			deps:['mui']
		}
	}
})