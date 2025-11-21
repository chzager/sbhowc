// TODO requires full review
// TODO	requires ts-check
// DOC entire file
class OwcUI
{
	constructor()
	{
		this.isTouchDevice = "ontouchstart" in document.documentElement;
		this.notifications = {
			count: 0,
			offset: 0,
		};
	}

	notify (text, color = "green")
	{
		const _onAnimationEnd = (animationEvent) =>
		{
			animationEvent.target.remove();
			if ((this.notifications.count -= 1) === 0)
			{
				this.notifications.offset = 0;
			}
		};
		let element = makeElement("div.notification.popup." + color, text);
		element.addEventListener("animationend", _onAnimationEnd, { once: true });
		document.body.appendChild(element);
		let rect = element.getBoundingClientRect();
		element.style.left =
			Math.round((document.body.clientWidth - rect.width) / 2) + "px";
		element.style.top =
			Math.round(rect.top + this.notifications.offset) + "px";
		this.notifications.count += 1;
		this.notifications.offset += rect.height + 6;
	}

	showNotification (element)
	{
		this.animateElement(element, "visible");
	}

	animateElement (element, cssClass, postAnimationFunction)
	{
		element.classList.add(cssClass);
		element.addEventListener(
			"animationend",
			() =>
			{
				element.classList.remove(cssClass);
				if (typeof postAnimationFunction === "function")
				{
					postAnimationFunction(element);
				}
			},
			{ once: true }
		);
	}

	wait (message)
	{
		const loadingOverlay = document.getElementById("loading-wrapper");
		loadingOverlay.querySelector(".loading-text").innerText = message + "...";
		loadingOverlay.querySelector(".loading-gradient").classList.add("animated");
		loadingOverlay.style.display = "block";
	}

	waitEnd ()
	{
		const loadingOverlay = document.getElementById("loading-wrapper");
		loadingOverlay.style.display = "none";
		loadingOverlay.querySelector(".loading-gradient").classList.remove("animated");
	}
}
