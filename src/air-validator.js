/**
 * @name: air-validator
 * @version: 1.1.94
 * @author: A.I.Roland
 * @名称：AIR Common Form & Input Validator
 * @作者：张英磊
 * @site: https://github.com/airoland/air-validator
 * @org_site: https://github.com/air-js
 * @personal_site: https://github.com/airoland
 * @license: MIT
 * Please do not delete the copyright information
 * 请勿删除版权信息
 */

;
! function($, window, document, undefined) {
    "use strict";

    var tags = ['av-bind', 'av-tip', 'av-empty-tip', 'av-tipid', 'av-empty-tipid', 'av-tip-show', 'av-default', 'av-force', 'av-pattern', 'av-tip-class'
                , 'av-form', 'av-regexp', 'av-regexp-positive', 'av-compare', 'av-compare-tip', 'av-compare-tipid', 'av-compare-equal'
                , 'av-required', 'av-submit', 'av-blur', 'av-keyup', 'av-function', 'av-function-true', 'av-function-false'];
    var types = ['username', 'mobile', 'personname', 'idcard_cn', 'platenumber_cn', 'framenumber', 'enginenumber', 'number', 'money', 'phonenumber_cn', 'password', 'conpassword'];

    var win, dom, ready = {
        getPath: function() {
            var js = document.scripts,
                script = js[js.length - 1],
                jsPath = script.src;
            if (script.getAttribute('merge')) return;
            return jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
        }()
    };

    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    var air = $.extend({
        project: 'air.js',
        author: 'A.I.Roland',
        author_cn: '张英磊',
        org_site: 'https://github.com/air-js',
        personal_site: 'https://github.com/airoland',

        isEmpty: function(arg) {
            if (typeof(arg) == "undefined" || null == arg || "" === arg)
                return true;
            else if (typeof(arg) == "object") {
                var flag = true;
                $.each(arg, function(index, el) {
                    flag = false;
                    return false;
                });
                return flag;
            }
            else
                return false;
        },

        rmspStr: function(str) {
            for (var i = 0; i < str.length; i++)
                str = str.replace(' ', '');
            return str;
        },

        getParam: function(key) {
            var reg_url = /^[^\?]+\?([\w\W]+)$/,
                reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
                url = location.href,
                arr_url = reg_url.exec(url),
                ret = {};
            if (arr_url && arr_url[1]) {
                var str_para = arr_url[1],
                    result;
                while ((result = reg_para.exec(str_para)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            if (this.isEmpty(key))
                return ret;
            else
                return ret[key];
        },

        isMobile: function() {
            if (window.screen.width < 768 || document.body.clientWidth < 768)
                return true;
            else
                return false;
        },

        setRem: function() {
            $("body").prepend("<script>document.documentElement.style.fontSize = 20 * (document.body.clientWidth / 320) + 'px';</script>");
        }
    }, window.air);

    if (!air.validate_result)
        air.validate_result = {};
    if (!air.validate_bind)
        air.validate_bind = {};

    air.validate = function(user_options) {

        if (!air.isEmpty(user_options))
            main(user_options);

        var fn = air.validate;

        fn.bind = function(type, action) {
            air.validate_bind[type] = action;
        }

        fn.result = function(elem) {
            if(air.isEmpty(elem))
                return air.validate_result["*[av-form]"];
            return air.validate_result[elem];
        };

        // 将表单中有name属性的input集合成json对象，用于json提交表单的方式，如果绑定的不是form，则检测内部是否有form，否则自动包裹一个form
        fn.getJson = function(elem) {
            if ($(elem).get(0).tagName == "FORM")
                return $(elem).serializeObject();
            else if ($(elem + " form").get(0)) {
                return $(elem + " form").serializeObject();
            } else {
                $(elem).wrap('<form></form>');
                var validate_form_json = $(elem).parent().serializeObject();
                $(elem).unwrap();
                return validate_form_json;
            }
        };

        fn.go = function(elem) {
            if($(elem).get(0).tagName != "INPUT" && $(elem).get(0).tagName != "SELECT" && $(elem).get(0).tagName != "IMG" && $(elem).get(0).tagName != "TEXTAREA")
                $(elem + " [av-submit]").eq(0).trigger('click.air.validator');
            else {
                $(elem).each(function(index, el, event) {
                    $(this).trigger('blur.air.validator');
                    if(!air.validate_user_options[elem]){
                        console.error("[Air error]: The elem " + elem + " was not bind by air.validate.");
                        return false;
                    }
                    if(!air.validate_user_options[elem].showAll)
                        return false;
                });
            }
        };

        fn.off = function(elem) {
            if($(elem).get(0).tagName != "INPUT" && $(elem).get(0).tagName != "SELECT" && $(elem).get(0).tagName != "IMG" && $(elem).get(0).tagName != "TEXTAREA"){
                $(elem + " *[av-submit]").off('click.air.validator');
                $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").off('blur.air.validator');
                $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").off('keyup.air.validator');
            }
            else {
                $(elem).off('blur.air.validator');
                $(elem).off('keyup.air.validator');
            }
        };
    };

    if (!air.validate_user_options)
        air.validate_user_options = {};

    air.validate_global_options = $.extend(true, {
        elem: undefined,            // 绑定元素
        type: undefined,            // 验证类型
        tip: undefined,             // 验证失败的提示文字
        tipid: undefined,           // 提示的DOM的id
        tipClass: undefined,        // 自定义的提示样式
        emptyTip: undefined,        // 内容为空时的特殊提示，没有就按tip处理
        emptyTipid: undefined,      // 内容为空时的提示id，没有就按tipid处理
        showTip: true,              // 是否显示提示
        showAll: false,             // 一个form中的所有提示是否全部显示
        onSubmit: true,             // 是否在点击提交按钮时触发验证
        onBlur: undefined,          // 是否在blur时触发验证
        onKeyup: undefined,         // 是否在keyup时触发验证
        pattern: undefined,           // 是否强制只能输入验证通过的值
        submitForm: false,          // 是否直接提交表单
        before: undefined,          // 触发验证之前的操作
        after: undefined,           // 验证结束后的操作
        required: true,             // 是否进行非空验证
        regExp: undefined,          // 自定义验证的正则表达式
        regExpPositive: false,      // 是否正向验证regexp
        compare: undefined,         // 比对的元素
        compareTip: undefined,      // 比对未通过的提示文字
        compareTipid: undefined,    // 比对未通过的提示id，没有则按tipid处理
        compareEqual: true,         // 比对要求相等还是不相等
        valiFunction: undefined,    // 自定义验证函数
        functionTrue: undefined,    // 验证函数为真时的提示文字
        functionFalse: undefined,   // 验证函数为假时的提示文字
        force: undefined,           // 强制设置验证结果
		autoBind: false				// 是否自动绑定av-form标签
    }, air.validate_global_options);

    // 主方法
    function main(user_options) {
        var elem = "";
        if(!air.isEmpty(user_options)){
            if(air.isEmpty(user_options.elem)){
                air.validate_global_options = $.extend(true, {}, air.validate_global_options, user_options);
				if(user_options.autoBind){
					elem = "*[av-form]";
					user_options.elem = elem;
				}
                user_options = $.extend(true, {}, air.validate_global_options, user_options);
            }
            else {
                elem = user_options.elem;
                air.validate_user_options[elem] = $.extend(true, {}, air.validate_global_options, air.validate_user_options[elem], user_options);
                user_options = air.validate_user_options[elem];
            }
        }

        if(!air.isEmpty(elem))
            bind_events(user_options);
    };

    function bind_events(options) {
        var vali_flag = true;
        var elem = options.elem;
        // 判断是类form验证还是单个验证
        if ($(elem).get(0).tagName != "INPUT" && $(elem).get(0).tagName != "SELECT" && $(elem).get(0).tagName != "IMG" && $(elem).get(0).tagName != "TEXTAREA") {
            // 绑定提交按钮
            $(elem + " *[av-submit]").off('click.air.validator');
            $(elem + " *[av-submit]").on('click.air.validator', function(event) {
                $(elem + " *[av-bind]").each(function() {
                    vali_flag = combine_options($(this), options, 'submit', event, true);
                    if(vali_flag == "ignore" || vali_flag == "before_false"){
                        vali_flag = true;
                        return false;
                    }
                    if (!options.showAll)
                        return vali_flag;
                });
                air.validate_result[elem] = vali_flag;
                // 表单是否直接提交
                if (options.submitForm) {
                    $(elem).attr("onsubmit", "return air.validate.result('" + elem + "')");
                } else {
                    $(elem).attr("onsubmit", "return false");
                }
            });
            // 为所有表单控件绑定以下事件，达到动态绑定av-bind的效果
            // 绑定blur事件
            $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").off('blur.air.validator');
            $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").on('blur.air.validator', function(event) {
                if(typeof $(this).attr('av-bind') == "undefined")
                    return false;
                var blur_flag = combine_options($(this), options, 'blur', event, true);
                if(blur_flag == "ignore" || blur_flag == "before_false")
                    return false;
                var blur_dom = $(this), compare_flag = true;
                if (blur_flag) {
                    if (blur_dom.attr("av-bind") == "password") {
                        $(elem + " [av-bind=conpassword]").each(function() {
                            if (!air.isEmpty($(this).val()))
                                compare_flag = combine_options($(this), options, 'blur', event, true);
                        });
                    }
                    $(elem + " *[av-compare]").each(function() {
                        var compare_se = $(this).attr("av-compare");
                        if (!air.isEmpty($(this).val()) && $(compare_se)[0] == blur_dom[0]) {
                            compare_flag = combine_options($(this), options, 'blur', event, true);
                        }
                    });
                    blur_flag = compare_flag;
                }
                air.validate_result[elem] = blur_flag;
            });
            // 绑定keyup事件
            $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").off('keyup.air.validator');
            $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").on('keyup.air.validator', function(event) {
                if(typeof $(this).attr('av-bind') == "undefined")
                    return false;
                var keyup_flag = combine_options($(this), options, 'keyup', event, true);
                if(keyup_flag == "ignore" || keyup_flag == "before_false")
                    return false;
                air.validate_result[elem] = keyup_flag;
            });
            // pattern
            $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").off('keypress.air.validator');
            $(elem + " input," + elem + " select," + elem + " img," + elem + " textarea").on('keypress.air.validator', function(event) {
                if(typeof $(this).attr('av-pattern') == "undefined")
                    return true;
                var pattern_flag = combine_options($(this), options, 'pattern', event, true);
                if(pattern_flag == "ignore" || pattern_flag == "before_false")
                    return true;
                // air.validate_result[elem] = pattern_flag;
            });
        } else {
            $(elem).off('blur.air.validator');
            $(elem).on('blur.air.validator', function(event) {
                var blur_flag = combine_options($(this), options, 'blur', event, false);
                if(blur_flag == "ignore" || blur_flag == "before_false")
                    return false;
                var blur_dom = $(this), compare_flag = true;
                if (blur_flag) {
                    if (blur_dom.attr("av-bind") == "password") {
                        $(elem + " [av-bind=conpassword]").each(function() {
                            if (!air.isEmpty($(this).val()))
                                compare_flag = combine_options($(this), options, 'blur', event, false);
                        });
                    }
                    $(elem + " *[av-compare]").each(function() {
                        var compare_se = $(this).attr("av-compare");
                        if (!air.isEmpty($(this).val()) && $(compare_se)[0] == blur_dom[0]) {
                            compare_flag = combine_options($(this), options, 'blur', event, false);
                        }
                    });
                    blur_flag = compare_flag;
                }
                air.validate_result[elem] = blur_flag;
            });
            $(elem).off('keyup.air.validator');
            $(elem).on('keyup.air.validator', function(event) {
                var keyup_flag = combine_options($(this), options, 'keyup', event, false);
                if(keyup_flag == "ignore" || keyup_flag == "before_false")
                    return false;
                air.validate_result[elem] = keyup_flag;
            });
            $(elem).off('keypress.air.validator');
            $(elem).on('keypress.air.validator', function(event) {
                var pattern_flag = combine_options($(this), options, 'pattern', event, false);
                if(pattern_flag == "ignore" || pattern_flag == "before_false")
                    return true;
                // air.validate_result[elem] = keyup_flag;
            });
        }
    }

    function combine_options(dom, options, action, event, isform){
        var elem = options.elem;
        var temp_options = {};
        temp_options.type = !dom.attr('av-bind') ? undefined : dom.attr('av-bind');
        temp_options.required = (dom.attr("av-required") == "false" || dom.attr("av-required") == "true") ? eval(dom.attr("av-required")) : options.required;
        temp_options.force = (dom.attr("av-force") == "false" || dom.attr("av-force") == "true") ? eval(dom.attr("av-force")) : options.force;

        temp_options.onBlur = typeof dom.attr('av-blur') == "undefined" ? options.onBlur : (dom.attr("av-blur") == "false" ? false : true);
        temp_options.onKeyup = typeof dom.attr('av-keyup') == "undefined" ? options.onKeyup : (dom.attr("av-keyup") == "false" ? false : true);
        temp_options.pattern = typeof dom.attr('av-pattern') == "undefined" ? options.pattern : (dom.attr("av-pattern") == "false" ? false : true);

        temp_options.tip = !dom.attr('av-tip') ? undefined : dom.attr('av-tip');
        temp_options.tipid = !dom.attr('av-tipid') ? undefined : dom.attr('av-tipid');
        temp_options.tipClass = !dom.attr('av-tip-class') ? undefined : dom.attr('av-tip-class');
        temp_options.emptyTip = !dom.attr('av-empty-tip') ? undefined : dom.attr('av-empty-tip');
        temp_options.emptyTipid = !dom.attr('av-empty-tipid') ? undefined : dom.attr('av-empty-tipid');
        temp_options.showTip = (dom.attr("av-tip-show") == "false" || dom.attr("av-tip-show") == "true") ? eval(dom.attr("av-tip-show")) : options.showTip;

        temp_options.regExp = !dom.attr('av-regexp') ? undefined : dom.attr('av-regexp');
        temp_options.regExpPositive = (dom.attr("av-regexp-positive") == "false" || dom.attr("av-regexp-positive") == "true") ? eval(dom.attr("av-regexp-positive")) : options.regExpPositive;

        temp_options.compare = !dom.attr('av-compare') ? undefined : dom.attr('av-compare');
        temp_options.compareTip = !dom.attr('av-compare-tip') ? undefined : dom.attr('av-compare-tip');
        temp_options.compareTipid = !dom.attr('av-compare-tipid') ? undefined : dom.attr('av-compare-tipid');
        temp_options.compareEqual = (dom.attr("av-compare-equal") == "false" || dom.attr("av-compare-equal") == "true") ? eval(dom.attr("av-compare-equal")) : options.compareEqual;

        temp_options.valiFunction = !dom.attr('av-function') ? undefined : dom.attr('av-function');
        temp_options.functionTrue = !dom.attr('av-function-true') ? undefined : dom.attr('av-function-true');
        temp_options.functionFalse = !dom.attr('av-function-false') ? undefined : dom.attr('av-function-false');

        if(isform)
            temp_options = $.extend(true, {}, options, temp_options);
        else
            temp_options = $.extend(true, {}, temp_options, options);

        if((action == 'submit' && !temp_options.onSubmit) || (action == 'blur' && !temp_options.onBlur) || (action == 'keyup' && !temp_options.onKeyup) || (action == 'pattern' && !temp_options.pattern))
            return "ignore";
        else{
            var before_flag = true;
            temp_options.self = dom;
            temp_options.action = action;
            temp_options.isform = isform;
            temp_options.tagname = dom.get(0).tagName;
            temp_options.event = event;
            if(temp_options.before && typeof temp_options.before == "function")
                before_flag = temp_options.before(temp_options);
            if(air.isEmpty(before_flag) || eval(before_flag)){
                if(!air.isEmpty(before_flag) && typeof before_flag == "object")
                    temp_options = before_flag;
                return main_validate(temp_options, event);
            }
            else
                return "before_false";
        }
    }


    // 主验证模块
    function main_validate(options, event) {
        event = event ? event : window.event;
        var dom = options.self;
        var flag = true,
            empty_flag = false;
        var value = "",
            tip = "",
            tipid = "",
            emptyTipid = "";
        var type = options.type;
        var regexp = options.regExp;
        var tagname = dom.get(0).tagName;

        // 对radio和checkbox进行特殊判断
        if(dom.attr("type") == "radio" || dom.attr("type") == "checkbox"){
            var temp_name = dom.attr("name");
            $("*[name="+temp_name+"]").each(function(index, el) {
                if($(this).prop("checked"))
                    value = $(this).val();
            });
        }
        else if (tagname == "IMG")
            value = dom.attr('src');
        else
            value = dom.val();

        // 如果等于设置的默认值则按空处理，相当于用户并未填写
        if(!air.isEmpty(dom.attr("av-default"))){
            if(value == dom.attr("av-default"))
                value = "";
        }

        if(options.value)
            value = options.value;

        if(options.action == "pattern")
            value += String.fromCharCode(event.keyCode);

        if (air.isEmpty(value)) {
            if (type == "username") {
                tip = "请输入用户名";
            }
            if (type == "mobile_cn") {
                tip = "请输入手机号码";
            }
            if (type == "personname") {
                tip = "请输入姓名";
            }
            if (type == "idcard_cn") {
                tip = "请输入二代身份证号";
            }
            if (type == "platenumber_cn") {
                tip = "请输入车牌号";
            }
            if (type == "framenumber") {
                tip = "请输入车架号";
            }
            if (type == "enginenumber") {
                tip = "请输入发动机号";
            }
            if (type == "number") {
                tip = "请输入数字";
            }
            if (type == "integer") {
                tip = "请输入整数";
            }
            if (type == "integer_positive") {
                tip = "请输入正整数";
            }
            if (type == "money") {
                tip = "请输入金额";
            }
            if (type == "phonenumber_cn") {
                tip = "请输入手机或座机号码";
            }
            if (type == "password") {
                tip = "请输入密码";
            }
            if (type == "conpassword") {
                tip = "请输入确认密码";
            }

            if (air.isEmpty(tip))
                tip = "请您进行填写";
            flag = false;
            if (!flag)
                empty_flag = true;
            if (!options.required)
                flag = true;
        }
        else {
            // 用户名，校验规则：4-10位字母、数字或下划线，且只能由字母开头
            if (type == "username") {
                tip = "用户名：4-10位字母、数字或下划线，且只能由字母开头";
                if (!/^[a-zA-Z][a-zA-Z0-9_]{3,9}$/.test(value)) {
                    flag = false;
                }
            }
            // 手机号，校验规则：1开头的11位数字
            if (type == "mobile_cn") {
                tip = "请输入正确的手机号码";
                if (!/^1\d{10}$/.test(value)) {
                    flag = false;
                }
            }
            // 姓名，校验规则：汉字或英文
            if (type == "personname") {
                tip = "姓名中不能含有特殊字符";
                if (/[^\u4E00-\u9FA5a-zA-Z·.]/g.test(value)) {
                    flag = false;
                }
            }
            // 中国二代身份证号校验
            if (type == "idcard_cn") {
                tip = "身份证号格式错误";
                if (!IdentityCodeValid(value)) {
                    flag = false;
                }
            }
            // 中国车牌号，校验规则：汉字开头，第二位英文字母，后几位数字或英文
            if (type == "platenumber_cn") {
                tip = "请输入正确的车牌号";
                var plate_flag = true;
                var str = value.split('');
                if (value != "" && !/[\u4E00-\u9FA5]/g.test(value.substr(0, 1))) {
                    tip = "车牌号首位必须是汉字";
                    plate_flag = false;
                } else if (value != "" && /[\u4E00-\u9FA5]/g.test(value.substr(0, 1))) {
                    if(value.length > 1 && value.length < 8){
                        if (!/[\a-zA-Z]/.test(str[1])) {
                            tip = "车牌号第2位必须是英文字母";
                            plate_flag = false;
                        } else {
                            for (var i = 2; i < 7; i++) {
                                if (!/[\w]/.test(str[i])) {
                                    tip = "车牌号后5位必须是字母或数字";
                                    plate_flag = false;
                                    break;
                                }
                            }
                        }
                    }
                    if(plate_flag && value.length != 7){
                        tip = "车牌号应为7个字符";
                        plate_flag = false;
                    }
                }
                if (plate_flag == false) {
                    flag = false;
                }
            }
            // 车架号或发动机号，校验规则：英文或数字
            if (type == "framenumber" || type == "enginenumber") {
                if (type == "framenumber")
                    tip = "请输入正确的车架号";
                else
                    tip = "请输入正确的发动机号";
                if (/[^\w]/g.test(value)) {
                    flag = false;
                }
            }
            // 数字
            if (type == "number") {
                tip = "请输入数字";
                if (/[^\d]/g.test(value)) {
                    flag = false;
                }
            }
            // 整数
            if (type == "integer") {
                tip = "请输入整数";
                if (!/^-?\d+$/g.test(value)) {
                    flag = false;
                }
            }
            // 正整数
            if (type == "integer_positive") {
                tip = "请输入正整数";
                if (!/^[1-9]*[1-9][0-9]*$/g.test(value)) {
                    flag = false;
                }
            }
            // 钱，校验规则：合法正数且最多只保留两位小数，另外如012.11，0.00等等都不合法
            if (type == "money") {
                tip = "请输入正确金额";
                if (!/^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/.test(value)) {
                    flag = false;
                }
            }
            // 电话号码（手机或座机），校验规则：数字或横线-
            if (type == "phonenumber_cn") {
                tip = "请输入正确的手机或座机号码";
                if (/[^\d-]/g.test(value)) {
                    flag = false;
                }
            }
            // 密码：6-16位
            if (type == "password") {
                tip = "密码长度为6-16位";
                if (!/^.{6,16}$/g.test(value)) {
                    flag = false;
                }
            }
            // 确认密码：6-16位，并且与密码相等
            if (type == "conpassword") {
                tip = "确认密码长度为6-16位";
                if (!/^.{6,16}$/g.test(value)) {
                    flag = false;
                } else {
                    var password_value = $(options.elem + " [av-bind=password]").val();
                    if (!air.isEmpty(password_value) && password_value != value) {
                        tip = "两次密码输入不一致";
                        flag = false;
                    }
                }
            }

            // 自定义的正则表达式，positive表示这个验证是否是正向的，如果是正向的，则正则表达式通过代表验证通过。如果是反向的，则正则表达式通过代表验证失败。默认为反向验证。
            if (!air.isEmpty(regexp)) {
                regexp = eval(regexp);
                if (options.regExpPositive) {
                    if (regexp.test(value)) {
                        flag = true;
                    } else {
                        // tip = "您的输入不正确";
                        flag = false;
                    }
                } else {
                    if (regexp.test(value)) {
                        // tip = "您的输入不正确";
                        flag = false;
                    } else {
                        flag = true;
                    }
                }
            }

            if (air.isEmpty(tip))
                tip = "您的填写不正确";
        }

        if(options.action == "pattern" && !flag){
            window.event.returnValue = false;
            return false;
        }

        if (!air.isEmpty(options.tip))
            tip = options.tip;
        if (!air.isEmpty(options.tipid))
            tipid = options.tipid;

        if (empty_flag) {
            if (!air.isEmpty(options.emptyTip))
                tip = options.emptyTip;
            if (!air.isEmpty(options.emptyTipid))
                emptyTipid = options.emptyTipid;
        }

        options.flag = flag;
        options.emptyflag = empty_flag;
        options.tip = tip;
        // options.tipid = tipid;
        // options.emptyTipid = emptyTipid;
        options.value = value;
        options.event = event;

        if (!air.isEmpty(air.validate_bind[type])) {
            flag = air.validate_bind[type](options);
            if(air.isEmpty(flag))
                options.flag = true;
            if(typeof flag != "boolean"){
                if(typeof flag == "object")
                    options = flag;
                else {
                    console.error("[Air error]: The type of return value is not correct in the action of " + type);
                    return "ignore";
                }
            }
            else
                options.flag = flag;
        }

        // 比对
        var compare_se = options.compare;
        if (!air.isEmpty(compare_se)) {
            if (options.flag) {
                if (options.compareEqual && options.value != $(compare_se).val()) {
                    options.tip = "两次输入不一致";
                    options.flag = false;
                } else if (!options.compareEqual && options.value == $(compare_se).val()) {
                    options.tip = "两次输入不能相等";
                    options.flag = false;
                }
                if (!options.flag) {
                    if (!air.isEmpty(options.compareTip))
                        options.tip = options.compareTip;
                    if (!air.isEmpty(options.compareTipid))
                        options.tipid = options.compareTipid;
                }
            }
        }

        // 验证函数，可自己定义通过函数返回的真假来验证非空表单，并规定提示语
        var vali_function = options.avFunction;
        var function_flag = false;
        if (!air.isEmpty(vali_function)) {
            if(typeof vali_function == "string")
                vali_function = eval(vali_function);
            if(!air.isEmpty(vali_function) && typeof vali_function == "function"){
                function_flag = vali_function(options);
                if(air.isEmpty(function_flag))
                    options.flag = true;
                if(typeof function_flag != "boolean"){
                    if(typeof function_flag == "object")
                        options = function_flag;
                    else {
                        console.error("[Air error]: The type of return value is not correct in the av-function " + options.avFunction);
                        return "ignore";
                    }
                }
                else
                    options.flag = function_flag;
                if (options.flag) {
                    if (!air.isEmpty(options.functionTrue))
                        options.tip = options.functionTrue;
                } else {
                    if (!air.isEmpty(options.functionFalse))
                        options.tip = options.functionFalse;
                }
            }
            else
                console.warn("[Air warn]: Can not find the reference of av-function named " + option.avFunction);
        }

        if(!air.isEmpty(options.force))
            options.flag = options.force;

        if (options.after && typeof options.after == "function") {
            if(type == "password"){
                if(/[a-zA-Z]/.test(value) && /[0-9]/.test(value) && /\W/.test(value) && /\D/.test(value)) {
                    options.pwdStrength = 'high';
                }else if(/[a-zA-Z]/.test(value) || /[0-9]/.test(value) || /\W/.test(value) || /\D/.test(value)) {
                    if(/[a-zA-Z]/.test(value) && /[0-9]/.test(value)) {
                        options.pwdStrength = 'medium';
                    }else if(/[a-zA-Z]/.test(value) && /\W/.test(value) && /\D/.test(value)) {
                        options.pwdStrength = 'medium';
                    }else if(/[0-9]/.test(value) && /\W/.test(value) && /\D/.test(value)) {
                        options.pwdStrength = 'medium';
                    }else{
                        options.pwdStrength = 'low';
                    }
                }
            }
            var after_flag = options.after(options);
            if(typeof after_flag == "boolean")
                options.flag = after_flag;
            else if (!air.isEmpty(after_flag) && typeof after_flag == "object")
                options = after_flag;
        }

        // 验证不通过则显示tip
        tip = options.tip;
        tipid = options.tipid;
        emptyTipid = options.emptyTipid;
        var tipClass = options.tipClass;
        if (options.showTip && !options.flag) {
            if (options.emptyflag && !air.isEmpty(emptyTipid)){
                controlTip(tip, tipid, "hide", tipClass);
                controlTip(tip, emptyTipid, "show", tipClass);
            }
            else if (!air.isEmpty(tipid)) {
                controlTip(tip, emptyTipid, "hide", tipClass);
                controlTip(tip, tipid, "show", tipClass);
            }
        } else {
            controlTip(tip, emptyTipid, "hide", tipClass);
            controlTip(tip, tipid, "hide", tipClass);
        }
        return options.flag;
    };

    function controlTip(tip, tipid, action, tipClass){
        if(!air.isEmpty(tipid)){
            if(action == "show"){
                $("#" + tipid).text(tip);
                if(!air.isEmpty(tipClass)){
                    $("#" + tipid).addClass(tipClass);
                    $("#" + tipid).addClass("av-show");
                }
                else{
                    $("#" + tipid).show();
                    $("#" + tipid).parent().show();
                }
            }
            else {
                if(!air.isEmpty(tipClass)){
                    $("#" + tipid).addClass(tipClass);
                    $("#" + tipid).removeClass("av-show");
                }
                else{
                    $("#" + tipid).hide();
                }
            }
        }
    }

    // 二代身份证校验
    function IdentityCodeValid(code) {
        var city = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏"
	    			,33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南"
	    			,50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾"
	    			,81:"香港",82:"澳门",91:"国外 "};
        var tip = "";
        var pass = true;

        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误";
            pass = false;
        } else if (!city[code.substr(0, 2)]) {
            tip = "身份证号格式错误";
            pass = false;
        } else {
            //18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                if (code[17] == 'x')
                    code[17] = 'X';
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17]) {
                    tip = "身份证号格式错误";
                    pass = false;
                }
            }
        }
        return pass;
    }

    window.air = air;

    //主入口
    ready.run = function() {
        win = $(window);
        window.air.validate();
    };

    'function' === typeof define ? define(function() {
        ready.run();
        return air;
    }) : function() {
        ready.run();
    }();

}(jQuery, window, document);
