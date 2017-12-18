$.fn.jigsaw = function(info){ //oka的拼圖遊戲套件
	var default_nun = 3,
		default_time = 30,
		level = info.level || default_nun, //取拼圖的水平數量
		vertical = info.vertical || default_nun, //取拼圖的垂直數量
		timer = info.timer || default_time; //取時間限制(秒)

	/*================== 避免錯誤 ====================*/

	if( level == 1 && vertical == 1 ){ //如果有人設為 1 x 1,那就改回預設值
		level = default_nun;
		vertical = default_nun;
	}

	if( level < 1 ){
		level = default_nun;
	}

	if( vertical < 1 ){
		vertical = default_nun;
	}

	if( timer < 1 ){
		alert('時間設定不得小於1。'); //如果時間限制小於1秒，跳出警示
		return false;
	}


	/*================== 取其他待用數值 ====================*/
	
	var $body = $('body'), //取body
		$dom = $(document),
		js_length = level * vertical, //拼圖的數量
		step = 0, //步數計算
		highest; //最低分
		$oka_jigsaw = $(this);


	/*================== 遊戲初始化 ====================*/

	for( i = 0; i < js_length; i++ ){ //加入設定的拼圖數量
		$oka_jigsaw.append('<div class="jigsaw" />');
	}
	
	$oka_jigsaw.append('<span /><p />'); //增加計時器顯示區塊與說明文字區塊

	var $js = $('.jigsaw'), //取拼圖集合
		$span = $oka_jigsaw.find('span'),
		$p = $oka_jigsaw.find('p');

	var i = range(), //排列並打亂圖片順序
		js_w = i.js_w, //取圖寬高&圖源
		js_h = i.js_h;

	initialize(); //文字初始化

	/*================== 遊戲開始(定時器、拖曳、判斷) ====================*/

	alert('請用游標拖曳拼圖以移動。'); //提示

	$oka_jigsaw.one('mouseover',function(){ //進入遊戲畫面開始計時
		myVar = setInterval(times_clock, 1000);
	});

	$js.mousedown(function(e){ 
		e.stopPropagation(); //別再冒泡了大哥
		e.preventDefault(); //ff會拖到一堆東西，很討厭

		var $this = $(this), //mousedown的物件
			css = $this.css(['top','left']),
			$this_pos = $this.offset(), //求物件定位
			dom_t = $this_pos.top,
			dom_l = $this_pos.left,
			mou_Y = e.pageY, //求游標定位
			mou_X = e.pageX,
			$clone = $this.clone(); //clone物件

		$clone.addClass('opacity').css({
			'top': dom_t,
			'left': dom_l
		}).appendTo('body'); //clone顯示為透明，並且加入文件

		$dom.mousemove(function(e){ //clone跟著游標移動
			var	n_mou_Y = e.pageY, //求移動中滑鼠定位
				n_mou_X = e.pageX,
				n_dom_t = n_mou_Y - mou_Y + dom_t, //求clone定位
				n_dom_l = n_mou_X - mou_X + dom_l;

			$clone.css({ //clone改變top與left以移動
				'top': n_dom_t,
				'left': n_dom_l
			});

			$js.each(function(){ //逐一判斷游標是否在自己裡面 >///<
				var $box = $(this);

				if( mou_in_box($box, n_mou_Y, n_mou_X) ){ //如果游標在範圍內
					$box.addClass('box_shadow'); //容器加入陰影
				}else{
					$box.removeClass('box_shadow'); //容器刪除陰影
				}
			});
		});

		$dom.mouseup(function(e){ //放開滑鼠鍵
			var	n_mou_Y = e.pageY, //求移動中游標定位
				n_mou_X = e.pageX,
				n_dom_t = n_mou_Y - mou_Y + dom_t, //求clone定位
				n_dom_l = n_mou_X - mou_X + dom_l;

			step++; //步驟記錄、顯示
			$p.text('這是第'+ step +'步。');

			$js.each(function(){ //逐一判斷游標是否在自己裡面 >///<
				var $box = $(this);

				if( mou_in_box($box, n_mou_Y, n_mou_X) ){ //如果游標在容器內
					var j_css = $box.css(['top','left']); //取出該容器css

					$box.css({ //使mousedown物件跟自己交換位置
						'top': css.top,
						'left': css.left
					});

					$this.css({
						'top': j_css.top,
						'left': j_css.left
					});
				}
			});

			$dom.unbind('mousemove'); //取消綁定滑鼠移動及放開事件
			$dom.unbind('mouseup'); //取消綁定滑鼠移動及放開事件

			$js.removeClass('box_shadow'); //容器刪除陰影
			$clone.remove(); //刪除clone物件

			if( js_confirm(js_w,js_h) ){ //判斷是否所有物件符合期許位置

				if( highest == null || highest > step ){ //如果沒有最小步數或新紀錄更小的話
					highest = step
				}

				game_over('恭喜您過關,共走了'+ step +'步， \r\n 最少步數記錄為'+ highest +'步， \r\n 請問還要玩一次嗎？'); //遊戲結束提示 1
			}
		});
	});

	function range(){ //取圖片並排列的方法
		var $array = $oka_jigsaw.find('img'), //取集合
			array_langth = $array.length, //取集合的圖數量
			random = Math.floor( Math.random() * array_langth ),
			$this = $array.eq(random), //隨機取其中一圖
			img_w = $this.width(), //取圖寬高&圖源
			img_h = $this.height(),
			src = $this.attr('src'),
			js_w = img_w / level, //取拼圖寬高
			js_h = img_h / vertical;

		$array.hide(); //隱藏圖片
		$oka_jigsaw.append('<img src="'+ src +'" class="mini_pic" />'); //建立縮圖

		$oka_jigsaw.css({ //設定拼圖框的寬高與游標圖樣
			'width': img_w,
			'height': img_h,
			'cursor': 'pointer'
		});

		$js.css({ //賦予拼圖寬高與背景
			'width': js_w,
			'height': js_h,
			'background-image': 'url('+ src +')'
		});

		$js.each(function(index){ //逐一設定拼圖css並照規則排列出來
			var $this = $(this),
				col = index % level, //算出排 & 列
				row = Math.floor( ( index / level ) ),
				left = col * js_w, //算出left & top
				top = row * js_h;

			$this.css({ //設定位置&背景定位
				'left': left,
				'top': top,
				'background-position': -1 * left +'px '+ -1 * top +'px'
			});
		});

		js_random(js_w,js_h); //把拼圖打亂排序

		return { 'js_w': js_w,'js_h': js_h};
	}

	function js_random(js_w,js_h){ //打亂順序的方法
		$js.each(function(){
			var $this = $(this), //逐一取出自己與自己的css
				css = $this.css(['top','left']),
				random = Math.floor( Math.random() * js_length ), //亂數取出一個兄弟，也取出他的css
				$js_random = $js.eq(random),
				r_css = $js_random.css(['top','left']);

			$this.css({ //然後彼此交換小祕密 >///<
				'top': r_css.top,
				'left': r_css.left
			});

			$js_random.css({
				'top': css.top,
				'left': css.left
			});
		});

		if( js_confirm(js_w,js_h) ){  //判斷是否所有物件符合期許位置
			js_random(js_w,js_h); //如果 ture 就再打亂一次，直到長得跟原圖不一樣
		}
	};

	function js_confirm(js_w,js_h){ //判斷是否所有物件符合期許位置
		var ans = 0; //設定答對的數量

		$js.each(function(index){
			var	$this = $(this),
				col = index % level, //算出排 & 列
				row = Math.floor( ( index / level ) ),
				left = col * js_w, //算出left & top
				top = row * js_h;

			if( parseInt( $this.css('left') ) == Math.floor( left ) && parseInt( $this.css('top') ) == Math.floor( top ) ){ //如果定位 == 自己的定位
				ans++;
			}
		});

		if( ans == js_length ){ //如果對的數量 == 全部的數量
			return true; //就對了 ヾ(*´v｀*)ﾉ
		}
	}

	function initialize(){ //初始化
		$span.text('倒數計時器'); //將計時器初始化
		$p.text('步數計算器'); //說明文字初始化.
		step = 0;
	}

	function times_clock(){ //計時器
		timer--;

		if( timer >= 0 ){
			$span.text( '剩餘時間： '+ timer +'秒' ); //計算秒數並印出
		}else{
			game_over('剩餘時間不足，您還要再挑戰一次嗎？'); //遊戲結束提示 2
		}
	}

	function mou_in_box($js, n_mou_Y, n_mou_X){ //判斷游標是否在自己裡面的方法 >///<
		var $js_pos = $js.offset(), //求拼圖的定位
			js_t = $js_pos.top,
			js_l = $js_pos.left,
			js_area_y = js_t + js_h, //求box的範圍
			js_area_x = js_l + js_w;

		if( n_mou_Y > js_t && n_mou_Y < js_area_y && n_mou_X > js_l && n_mou_X < js_area_x ){ //檢查上下左右都在範圍內
			return true; //在容器內就回傳true
		}
	}

	function game_over(str){ //遊戲結束啟動動作
		
		timer = info.timer; //回歸時間限制
		$('.mini_pic').remove();

		var again = confirm(str); //設定confrim視窗的文字

		if( again ){ //如果還要繼續玩
			initialize(); //文字初始化
			range(); //重新取圖排列

		}else{ //如果不想玩了...
			$js.unbind('mousedown'); //取銷綁定拖曳式漸
			$span.text('game over'); 
			$p.text('make by oka');
			clearInterval(myVar); //取消計時器
		}
	}
}