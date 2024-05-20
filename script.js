// script.js

(function () {
	
	var previewForm = document.getElementById('previewform');

	var url = location.search.substring(1).replace(/\/\/github\.com/, '//raw.githubusercontent.com').replace(/\/blob\//, '/'); //Get URL of the raw file

	var replaceAssets = function () {
		var frame, a, link, links = [], script, scripts = [], i, href, src;
		//Framesets
		if (document.querySelectorAll('frameset').length)
			return; //Don't replace CSS/JS if it's a frameset, because it will be erased by document.write()
		//Frames
		frame = document.querySelectorAll('iframe[src],frame[src]');
		for (i = 0; i < frame.length; ++i) {
			src = frame[i].src; //Get absolute URL
			if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				frame[i].src = '//' + location.hostname + location.pathname + '?' + src; //Then rewrite URL so it can be loaded using CORS proxy
			}
		}
		//Links
		a = document.querySelectorAll('a[href]');
		for (i = 0; i < a.length; ++i) {
			href = a[i].href; //Get absolute URL
			if (href.indexOf('#') > 0) { //Check if it's an anchor
				a[i].href = '//' + location.hostname + location.pathname + location.search + '#' + a[i].hash.substring(1); //Then rewrite URL with support for empty anchor
			} else if ((href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) && (href.indexOf('.html') > 0 || href.indexOf('.htm') > 0)) { //Check if it's from raw.github.com or bitbucket.org and to HTML files
				a[i].href = '//' + location.hostname + location.pathname + '?' + href; //Then rewrite URL so it can be loaded using CORS proxy
			}
		}
		//Stylesheets
		link = document.querySelectorAll('link[rel=stylesheet]');
		for (i = 0; i < link.length; ++i) {
			href = link[i].href; //Get absolute URL
			if (href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				links.push(fetchProxy(href, null, 0)); //Then add it to links queue and fetch using CORS proxy
			}
		}
		Promise.all(links).then(function (res) {
			for (i = 0; i < res.length; ++i) {
				loadCSS(res[i]);
			}
		});
		//Scripts
		script = document.querySelectorAll('script[type="text/htmlpreview"]');
		for (i = 0; i < script.length; ++i) {
			src = script[i].src; //Get absolute URL
			if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
				scripts.push(fetchProxy(src, null, 0)); //Then add it to scripts queue and fetch using CORS proxy
			} else {
				script[i].removeAttribute('type');
				scripts.push(script[i].innerHTML); //Add inline script to queue to eval in order
			}
		}
		Promise.all(scripts).then(function (res) {
			for (i = 0; i < res.length; ++i) {
				loadJS(res[i]);
			}
			document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true, cancelable: true})); //Dispatch DOMContentLoaded event after loading all scripts
		});
	};

	var loadHTML = function (data) {
		if (data) {
			data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">').replace(/<script(\s*src=["'][^"']*["'])?(\s*type=["'](text|application)\/javascript["'])?/gi, '<script type="text/htmlpreview"$1'); //Add <base> just after <head> and replace <script type="text/javascript"> with <script type="text/htmlpreview">
			setTimeout(function () {
				document.open();
				document.write(data);
				document.close();
				replaceAssets();
			}, 10); //Delay updating document to have it cleared before
		}
	};

	var loadCSS = function (data) {
		if (data) {
			var style = document.createElement('style');
			style.innerHTML = data;
			document.head.appendChild(style);
		}
	};

	var loadJS = function (data) {
		if (data) {
			var script = document.createElement('script');
			script.innerHTML = data;
			document.body.appendChild(script);
		}
	};
	
	var fetchProxy = function (url, options, i) {
		var proxy = [
			'', // try without proxy first
			'https://api.codetabs.com/v1/proxy/?quest='
		];
		return fetch(proxy[i] + url, options).then(function (res) {
			if (!res.ok) throw new Error('Cannot load ' + url + ': ' + res.status + ' ' + res.statusText);
			return res.text();
		}).catch(function (error) {
			if (i === proxy.length - 1)
				throw error;
			return fetchProxy(url, options, i + 1);
		})
	};

	if (url && url.indexOf(location.hostname) < 0)
		fetchProxy(url, null, 0).then(loadHTML).catch(function (error) {
			console.error(error);
			previewForm.style.display = 'block';
			previewForm.innerText = error;
		});
	else
		previewForm.style.display = 'block';

})()

const displayElement = document.getElementById('display');
let displayValue = '0';
let awaitingNextValue = false;
let operator = null;
let firstValue = null;

function appendValue(value) {
    if (awaitingNextValue) {
        displayValue = value;
        awaitingNextValue = false;
    } else {
        displayValue = displayValue === '0' ? value : displayValue + value;
    }
    updateDisplay();
}

function updateDisplay() {
    displayElement.innerText = displayValue;
}

function clearDisplay() {
    displayValue = '0';
    awaitingNextValue = false;
    operator = null;
    firstValue = null;
    updateDisplay();
}

function deleteLast() {
    displayValue = displayValue.slice(0, -1) || '0';
    updateDisplay();
}

function calculateResult() {
    if (firstValue === null || operator === null) return;

    const secondValue = parseFloat(displayValue);
    switch (operator) {
        case '+':
            displayValue = (firstValue + secondValue).toString();
            break;
        case '-':
            displayValue = (firstValue - secondValue).toString();
            break;
        case '*':
            displayValue = (firstValue * secondValue).toString();
            break;
        case '/':
            displayValue = (firstValue / secondValue).toString();
            break;
    }

    operator = null;
    firstValue = null;
    awaitingNextValue = true;
    updateDisplay();
}

function setOperator(op) {
    if (operator !== null) calculateResult();

    firstValue = parseFloat(displayValue);
    operator = op;
    awaitingNextValue = true;
}

document.querySelector('.buttons').addEventListener('click', (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const value = target.innerText;

    if (!target.classList.contains('btn')) return;

    switch (action) {
        case 'number':
            appendValue(value);
            break;
        case 'operator':
            setOperator(value);
            break;
        case 'decimal':
            if (!displayValue.includes('.')) appendValue('.');
            break;
        case 'clear':
            clearDisplay();
            break;
        case 'delete':
            deleteLast();
            break;
        case 'calculate':
            calculateResult();
            break;
    }
});

document.getElementById('theme-switch').addEventListener('change', () => {
    document.body.classList.toggle('night');
});
