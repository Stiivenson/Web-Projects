let header = $('header'),
head_sectn_name = $('.head_sectn_name'),
loader = $('.loader'),
loader_time = $(".loader .percent"),
menu = $(".popup_menu"),
autoscope = $('.popup_autoscope'),
autoscope_in = $('.popup_autoscope .popup_container'),
serv_container = $('.services .serv_inner_container'),
serv_tabs = $('.services .tabs'),
sauto_tabs_container = $('.tabs_auto'),
sauto_tabs = $('.tabs_inner'),
sauto_inr = $('.serv_auto_inner'),
sauto_img = $('.container_img');

//Запуск прелоадера
function loading(time, callback) {
    var _loop = function _loop(i) {
        var t = time / 10 * i;
        setTimeout(function () {
            loader_time.text(10 * i + '%');
        }, t);
    };
    for (var i = 1; i <= 10; i++) {
        _loop(i);
    }
    setTimeout(callback, time + time / 5);
}
loading(2000, function () {
    $(document).ready(function(){
        //Создание плавного меню
        $(".main").onepage_scroll({
            sectionContainer: "section",   
            easing: "ease",                  
            animationTime: 1000,             
            pagination: true,                
            updateURL: false,                  
            loop: false,                     
            keyboard: true,                  
            responsiveFallback: 1200, 
            beforeMove: function(index){
                if(index === 1)
                    header.removeClass('small');
                else             
                    header.addClass('small');
                head_sectn_name.removeClass('active');  
            },
            afterMove: function(index){
                chngSectionName(index);
            },
            direction: "vertical"
        });
        var page = $('.onepage-pagination');

        loader.addClass('loaded');;
        $('section').addClass('loaded');
        menu.addClass('loaded');
        header.addClass('loaded');
        page.addClass('loaded');
    
        //Смена названия секции
        function chngSectionName(index) {
            if(index == 1){
                return;
            } else 
            head_sectn_name.addClass('active');
        }
    
        //Управление меню
        $('.active_menu').click(function(){
            if(menu.hasClass("active")){
                menu.removeClass("active");
            } else {
                menu.addClass("active");
            }
        });
        $('.close_menu').click(function(){
            menu.removeClass("active");
        });
    
        //Модальное окно - 2 секция
        $('.autoscope_hrf').click(function(){
            autoscope.addClass('active');
            autoscope_in.addClass('active');
        });
        $('.close_autoscope').click(function(){
            autoscope_in.removeClass('active');
            autoscope.removeClass('active');
        });  
        
        //Услуги - управление табами
        showTab = function(i){
            serv_container.children('.serv_inner').removeClass('active');
            serv_container.children('.serv_inner').eq(i).addClass('active');
            serv_tabs.children().removeClass('active');
            serv_tabs.children().eq(i).addClass('active');
        }
        showTab(0);
    
        let i=0;
        serv_tabs.children().each(function(index, element){
            $(element).attr("tub_num", i);
            i++;                        
        });
    
        serv_tabs.children().click(function(){
            showTab(parseInt($(this).attr("tub_num")));
        });				
    
        //Услуги по маркам - управление табами
        let atab_numb = 0,
        atab_max = sauto_tabs.children().length;
    
        showAutoTab = function(num){
            sauto_tabs.children().removeClass('active');
            sauto_inr.children().removeClass('active');
            sauto_img.children().removeClass('active');
            sauto_tabs.children().eq(num).addClass('active');
            sauto_inr.children().eq(num).addClass('active');
            sauto_img.children().eq(num).addClass('active');
            if(num == (atab_max-1)){
                sauto_tabs_container.addClass("big");
            } else
            sauto_tabs_container.removeClass("big"); 
        }
        showAutoTab(0);
        $('.left').click(function(){
            atab_numb--;
            if(atab_numb < 0){
                atab_numb = atab_max-1;
                showAutoTab(atab_numb);
                return;
            }
            showAutoTab(atab_numb);
        });
        $('.right').click(function(){
            atab_numb++;
            if(atab_numb == atab_max){
                showAutoTab(0);
                atab_numb = 0;
                return;
            }
            showAutoTab(atab_numb);
        });
        
    
            [].forEach.call( document.querySelectorAll('#tel'), function(input) {
                var keyCode;
                function mask(event) {
                    event.keyCode && (keyCode = event.keyCode);
                    var pos = this.selectionStart;
                    if (pos < 3) event.preventDefault();
                    var matrix = "+7 (___) ___ ____",
                        i = 0,
                        def = matrix.replace(/\D/g, ""),
                        val = this.value.replace(/\D/g, ""),
                        new_value = matrix.replace(/[_\d]/g, function(a) {
                            return i < val.length ? val.charAt(i++) || def.charAt(i) : a
                        });
                    i = new_value.indexOf("_");
                    if (i != -1) {
                        i < 5 && (i = 3);
                        new_value = new_value.slice(0, i)
                    }
                    var reg = matrix.substr(0, this.value.length).replace(/_+/g,
                        function(a) {
                            return "\\d{1," + a.length + "}"
                        }).replace(/[+()]/g, "\\$&");
                    reg = new RegExp("^" + reg + "$");
                    if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
                    if (event.type == "blur" && this.value.length < 5)  this.value = ""
                }
                input.addEventListener("input", mask, false);
                input.addEventListener("focus", mask, false);
                input.addEventListener("blur", mask, false);
                input.addEventListener("keydown", mask, false)
            });
    });
});



