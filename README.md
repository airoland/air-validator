# air-validator
A Common Form & Input Validator

Author: A.I.Roland

作者：张英磊

License: MIT

使用者须保留文件中的作者版权信息

Version: 1.1.8

Notice: jQuery is neccessary.

#中文文档 (English documentation will come soon.)

##简介

air-validator是一个WEB通用表单验证工具，致力于在尽可能的范围内，以尽量高的灵活性、清晰度，并且较少的代码帮助开发人员完成表单（或输入框）的验证工作。

注意：本工具依赖于jQuery，以后会考虑推出原生JS的版本。

##开源说明

目前V1.1.8版本功能已经完备，但代码还有可以优化和精简的地方，因此暂不开源，只提供压缩版本（在dist目录下）。等版本更新到V1.2.0优化以后会全面开源。

##如何使用

###快速入门

一个最简单的使用方式如下。

首先引入`air-validator.js`

随后在HTML中：

```html
<form id="testform">
	<input av-bind="number" />
	<button type="button" av-submit>submit</button>
</form>
```

在JavaScript中：

```javascript
air.validate.form("#testform");
```

这样做的效果是，当你点击submit按钮提交时，air-validator会自动验证输入框的内容是不是整数，如果不是整数，则阻止表单提交，并在上方显示提示。

（未完待续）