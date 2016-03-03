# air-validator
A Common Form & Input Validator

Author: A.I.Roland

作者：张英磊

License: MIT

使用者须保留文件中的作者版权信息

Version: 1.2.0

Notice: jQuery is neccessary.

#中文文档 (English documentation will come soon.)

##简介

air-validator是一个WEB通用表单验证工具，致力于在尽可能的范围内，以尽量少的代码帮助开发人员完成表单（或输入框）的验证工作。

注意：本工具依赖于jQuery，原生JS版本将在以后推出。

##如何使用

###快速入门

一个最简单的使用方式如下。

首先引入`air-validator.js`

随后在HTML中：

```html
<form id="testform">
	<input av-type="number" />
	<button type="button" av-action="submit">submit</button>
</form>
```

在JavaScript中：

```javascript
air.validate.form("#testform");
```

这样做的效果是，当你点击submit按钮提交时，air-validator会自动验证输入框内是否是数字，如果不是数字，则阻止表单提交，并在上方显示提示。