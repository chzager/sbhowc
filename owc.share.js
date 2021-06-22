"use strict";


owc.share = function (protocol)
{
	function _unicodify(text, chars = "")
	{
		for (let c = 0, cc = chars.length; c < cc; c += 1)
		{
			text = text.replaceAll(chars[c], "%" + chars.charCodeAt(c).toString(16));
		};
		return text;
	};
	let url = window.location.setParams(
	{
		[owc.urlParam.WARBAND]: owc.warband.toString()
	}
		);
	switch (protocol)
	{
	case "whatsapp":
		console.log(_unicodify(url, "%+"));
		window.open("whatsapp://send?text=*" + _unicodify(document.title, "*") + "*%0d%0a" + _unicodify(url, "%+"));
		break;
	case "facebook":
		window.open("https://www.facebook.com/sharer/sharer.php?u=" + url + "&t=" + document.title);
		break;
	case "twitter":
		window.open("https://twitter.com/share?url=" + _unicodify(url, "%+") + "&text=" + owc.helper.nonBlankWarbandName());
		break;
	case "email":
		console.log(_unicodify(url, "%%"));
		window.open("mailto:?subject=" + document.title + "&body=" + _unicodify(url, "%%"));
		break;
	case "link":
		history.replaceState({}, "", url);
		owc.ui.notify("Link created. Ready to share.");
		break;
	case "browser":
		{
			if (typeof navigator.share === "function")
			{
				navigator.share(
				{
					"title": document.title,
					"text": document.title,
					"url": url
				}
				).then(() => null, (reason) => console.error(reason));
			};
		};
		break;
	};
};
